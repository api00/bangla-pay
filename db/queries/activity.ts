import "server-only";

import { and, asc, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { tips } from "@/db/schema";

export interface DailyActivity {
  /** ISO YYYY-MM-DD in Asia/Dhaka. */
  date: string;
  totalPaisa: number;
  tipCount: number;
}

/**
 * 30-day rolling activity for the dashboard sparkline.
 * Bucketed by Asia/Dhaka day so the chart matches the creator's local mental model.
 */
export async function getDailyActivity(
  creatorId: string,
  days = 30,
): Promise<DailyActivity[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      day: sql<string>`to_char((${tips.createdAt} AT TIME ZONE 'Asia/Dhaka')::date, 'YYYY-MM-DD')`,
      totalPaisa: sql<number>`COALESCE(SUM(${tips.amountPaisa}), 0)::int`,
      tipCount: sql<number>`COUNT(*)::int`,
    })
    .from(tips)
    .where(
      and(
        eq(tips.creatorId, creatorId),
        eq(tips.status, "succeeded"),
        gte(tips.createdAt, since),
      ),
    )
    .groupBy(sql`(${tips.createdAt} AT TIME ZONE 'Asia/Dhaka')::date`)
    .orderBy(asc(sql`(${tips.createdAt} AT TIME ZONE 'Asia/Dhaka')::date`));

  // Fill missing days so the sparkline has a continuous x-axis.
  const filled: DailyActivity[] = [];
  const cursor = new Date(since);
  for (let i = 0; i < days; i += 1) {
    const iso = cursor.toISOString().slice(0, 10);
    const match = rows.find((r) => r.day === iso);
    filled.push({
      date: iso,
      totalPaisa: Number(match?.totalPaisa ?? 0),
      tipCount: Number(match?.tipCount ?? 0),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return filled;
}
