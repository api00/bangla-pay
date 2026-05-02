import "server-only";

import { and, desc, eq, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  payoutMethods,
  payouts,
  tips,
  type Payout,
  type PayoutMethod,
} from "@/db/schema";

export async function listPayoutMethods(
  creatorId: string,
): Promise<PayoutMethod[]> {
  return db
    .select()
    .from(payoutMethods)
    .where(eq(payoutMethods.creatorId, creatorId))
    .orderBy(desc(payoutMethods.isDefault), desc(payoutMethods.createdAt));
}

export async function getDefaultPayoutMethod(
  creatorId: string,
): Promise<PayoutMethod | null> {
  const rows = await db
    .select()
    .from(payoutMethods)
    .where(
      and(
        eq(payoutMethods.creatorId, creatorId),
        eq(payoutMethods.isDefault, true),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function listPayouts(creatorId: string): Promise<Payout[]> {
  return db
    .select()
    .from(payouts)
    .where(eq(payouts.creatorId, creatorId))
    .orderBy(desc(payouts.requestedAt))
    .limit(50);
}

export interface BalanceSummary {
  /** Lifetime money received via succeeded tips. */
  totalRaisedPaisa: number;
  /** Sum of payouts in all non-failed states (i.e. money already committed out). */
  outboundPaisa: number;
  /** Available now: raised − committed. */
  availablePaisa: number;
  /** Currently in `requested` or `processing`. */
  inFlightPaisa: number;
}

/**
 * Compute the creator's withdrawable balance.
 *
 * Rules:
 * - Only `succeeded` tips count toward `totalRaisedPaisa`.
 * - Payouts in `requested` / `processing` / `settled` reduce availability.
 * - `failed` payouts free the money back.
 */
export async function getCreatorBalance(
  creatorId: string,
): Promise<BalanceSummary> {
  const [tipsRow] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${tips.amountPaisa}), 0)::int`,
    })
    .from(tips)
    .where(and(eq(tips.creatorId, creatorId), eq(tips.status, "succeeded")));

  const [committedRow] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${payouts.amountPaisa}), 0)::int`,
    })
    .from(payouts)
    .where(
      and(eq(payouts.creatorId, creatorId), ne(payouts.status, "failed")),
    );

  const [inFlightRow] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${payouts.amountPaisa}), 0)::int`,
    })
    .from(payouts)
    .where(
      and(
        eq(payouts.creatorId, creatorId),
        sql`${payouts.status} IN ('requested', 'processing')`,
      ),
    );

  const totalRaisedPaisa = Number(tipsRow?.total ?? 0);
  const outboundPaisa = Number(committedRow?.total ?? 0);
  const inFlightPaisa = Number(inFlightRow?.total ?? 0);
  const availablePaisa = Math.max(totalRaisedPaisa - outboundPaisa, 0);

  return {
    totalRaisedPaisa,
    outboundPaisa,
    availablePaisa,
    inFlightPaisa,
  };
}
