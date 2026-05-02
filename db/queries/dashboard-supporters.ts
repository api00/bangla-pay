import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { tips } from "@/db/schema";

export interface SupporterSummary {
  email: string | null;
  displayName: string | null;
  tipCount: number;
  totalPaisa: number;
  lastTipAt: Date;
  firstTipAt: Date;
}

/**
 * Roll up succeeded tips into one row per supporter (keyed by email; falls
 * back to display name for fully anonymous tips). Sorted by total descending.
 */
export async function listSupportersForCreator(
  creatorId: string,
  limit = 100,
): Promise<SupporterSummary[]> {
  const rows = await db
    .select({
      email: tips.supporterEmail,
      displayName: sql<string | null>`MAX(${tips.supporterName})`,
      tipCount: sql<number>`COUNT(*)::int`,
      totalPaisa: sql<number>`COALESCE(SUM(${tips.amountPaisa}), 0)::int`,
      lastTipAt: sql<Date>`MAX(${tips.createdAt})`,
      firstTipAt: sql<Date>`MIN(${tips.createdAt})`,
    })
    .from(tips)
    .where(and(eq(tips.creatorId, creatorId), eq(tips.status, "succeeded")))
    .groupBy(tips.supporterEmail)
    .orderBy(
      desc(sql`COALESCE(SUM(${tips.amountPaisa}), 0)`),
      desc(sql`MAX(${tips.createdAt})`),
    )
    .limit(limit);

  return rows.map((row) => ({
    email: row.email,
    displayName: row.displayName,
    tipCount: Number(row.tipCount) || 0,
    totalPaisa: Number(row.totalPaisa) || 0,
    lastTipAt: row.lastTipAt instanceof Date ? row.lastTipAt : new Date(row.lastTipAt),
    firstTipAt:
      row.firstTipAt instanceof Date ? row.firstTipAt : new Date(row.firstTipAt),
  }));
}
