import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";

export interface DailyActivity {
  /** ISO YYYY-MM-DD in Asia/Dhaka. */
  date: string;
  totalPaisa: number;
  contributionCount: number;
}

interface ActivityRow extends Record<string, unknown> {
  day: string;
  total_paisa: number;
  contribution_count: number;
}

const DHAKA_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dhaka",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Rolling earnings activity from successful tips and paid shop orders.
 * Bucketed by Asia/Dhaka day so the chart matches the creator's local time.
 */
export async function getDailyActivity(
  creatorId: string,
  days = 30,
): Promise<DailyActivity[]> {
  const safeDays = Math.min(Math.max(Math.trunc(days), 1), 365);
  const since = new Date(Date.now() - (safeDays - 1) * 24 * 60 * 60 * 1000);
  const sinceIso = since.toISOString();

  const rows = await db.execute<ActivityRow>(sql`
    WITH contributions AS (
      SELECT
        (COALESCE(paid_at, created_at) AT TIME ZONE 'Asia/Dhaka')::date AS day,
        amount_paisa
      FROM tips
      WHERE creator_id = ${creatorId}
        AND status = 'succeeded'
        AND COALESCE(paid_at, created_at) >= ${sinceIso}::timestamptz

      UNION ALL

      SELECT
        (COALESCE(paid_at, created_at) AT TIME ZONE 'Asia/Dhaka')::date AS day,
        total_paisa AS amount_paisa
      FROM orders
      WHERE creator_id = ${creatorId}
        AND status = 'paid'
        AND COALESCE(paid_at, created_at) >= ${sinceIso}::timestamptz
    )
    SELECT
      TO_CHAR(day, 'YYYY-MM-DD') AS day,
      COALESCE(SUM(amount_paisa), 0)::int AS total_paisa,
      COUNT(*)::int AS contribution_count
    FROM contributions
    GROUP BY day
    ORDER BY day ASC
  `);

  // Fill missing days so the sparkline has a continuous x-axis.
  const filled: DailyActivity[] = [];
  const cursor = new Date(since);
  for (let i = 0; i < safeDays; i += 1) {
    const iso = DHAKA_DATE.format(cursor);
    const match = rows.find((r) => r.day === iso);
    filled.push({
      date: iso,
      totalPaisa: Number(match?.total_paisa ?? 0),
      contributionCount: Number(match?.contribution_count ?? 0),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return filled;
}
