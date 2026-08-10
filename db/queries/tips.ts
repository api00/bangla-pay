import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { tips, type Tip } from "@/db/schema";

export interface CreatorTipStats {
  totalRaisedPaisa: number;
  supporterCount: number;
  succeededTipCount: number;
  pendingTipCount: number;
  averageTipPaisa: number;
}

export interface ListTipsOptions {
  limit?: number;
  status?: "pending" | "succeeded" | "failed" | "refunded";
}

/**
 * One-shot stats card for the dashboard home + creator metadata.
 * Uses RLS — caller must already be the creator (or service role).
 */
export async function getCreatorTipStats(
  creatorId: string,
): Promise<CreatorTipStats> {
  const [succeeded, pending] = await Promise.all([
    db
      .select({
        total: sql<number>`COALESCE(SUM(${tips.amountPaisa}), 0)::int`,
        count: sql<number>`COUNT(*)::int`,
        supporters: sql<number>`COUNT(DISTINCT COALESCE(
          CASE WHEN NULLIF(TRIM(${tips.supporterEmail}), '') IS NOT NULL
            THEN 'email:' || LOWER(TRIM(${tips.supporterEmail})) END,
          CASE WHEN ${tips.supporterId} IS NOT NULL
            THEN 'supporter:' || ${tips.supporterId}::text END,
          CASE WHEN NULLIF(TRIM(${tips.supporterName}), '') IS NOT NULL
            THEN 'name:' || LOWER(TRIM(${tips.supporterName})) END,
          'tip:' || ${tips.id}::text
        ))::int`,
      })
      .from(tips)
      .where(
        and(eq(tips.creatorId, creatorId), eq(tips.status, "succeeded")),
      ),
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(tips)
      .where(and(eq(tips.creatorId, creatorId), eq(tips.status, "pending"))),
  ]);

  const succeededRow = succeeded[0] ?? { total: 0, count: 0, supporters: 0 };
  const pendingRow = pending[0] ?? { count: 0 };
  const successCount = Number(succeededRow.count) || 0;
  const totalRaisedPaisa = Number(succeededRow.total) || 0;

  return {
    totalRaisedPaisa,
    supporterCount: Number(succeededRow.supporters) || 0,
    succeededTipCount: successCount,
    pendingTipCount: Number(pendingRow.count) || 0,
    averageTipPaisa:
      successCount > 0 ? Math.round(totalRaisedPaisa / successCount) : 0,
  };
}

/** Recent succeeded tips for the dashboard "recent activity" list. */
export async function recentSucceededTips(
  creatorId: string,
  limit = 5,
): Promise<Tip[]> {
  return db
    .select()
    .from(tips)
    .where(and(eq(tips.creatorId, creatorId), eq(tips.status, "succeeded")))
    .orderBy(desc(tips.createdAt))
    .limit(limit);
}

/** Tips inbox (paginated by limit; cursor pagination is Phase 7). */
export async function listTipsForCreator(
  creatorId: string,
  options: ListTipsOptions = {},
): Promise<Tip[]> {
  const { limit = 50, status } = options;
  const where = status
    ? and(eq(tips.creatorId, creatorId), eq(tips.status, status))
    : eq(tips.creatorId, creatorId);
  return db
    .select()
    .from(tips)
    .where(where)
    .orderBy(desc(tips.createdAt))
    .limit(limit);
}
