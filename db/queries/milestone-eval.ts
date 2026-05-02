import "server-only";

import { and, countDistinct, eq, isNull, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { milestones, tips } from "@/db/schema";

// Default milestone thresholds — auto-seeded the first time we evaluate.
// Values are paisa for `total_raised`; counts otherwise.
const SUPPORTER_THRESHOLDS = [1, 10, 50, 100, 500, 1_000];
const TOTAL_RAISED_THRESHOLDS_PAISA = [
  1_000_00, // ৳1,000
  10_000_00, // ৳10,000
  50_000_00, // ৳50,000
  100_000_00, // ৳100,000
  1_000_000_00, // ৳1,000,000
];

interface SeededDefaults {
  supporterCount: number[];
  totalRaisedPaisa: number[];
}

const DEFAULTS: SeededDefaults = {
  supporterCount: SUPPORTER_THRESHOLDS,
  totalRaisedPaisa: TOTAL_RAISED_THRESHOLDS_PAISA,
};

function buildTitle(
  kind: "supporter_count" | "total_raised",
  threshold: number,
): string {
  if (kind === "supporter_count") {
    if (threshold === 1) return "First supporter";
    return `${threshold.toLocaleString("en-BD")} supporters`;
  }
  // total_raised — threshold is paisa; render as taka.
  const taka = Math.trunc(threshold / 100);
  return `৳${taka.toLocaleString("en-BD")} raised`;
}

async function ensureSeeded(creatorId: string): Promise<void> {
  const existing = await db
    .select({ kind: milestones.kind, threshold: milestones.threshold })
    .from(milestones)
    .where(eq(milestones.creatorId, creatorId));

  const have = new Set(existing.map((r) => `${r.kind}:${r.threshold}`));
  const toInsert: {
    creatorId: string;
    kind: "supporter_count" | "total_raised";
    threshold: number;
    title: string;
  }[] = [];

  for (const t of DEFAULTS.supporterCount) {
    if (!have.has(`supporter_count:${t}`)) {
      toInsert.push({
        creatorId,
        kind: "supporter_count",
        threshold: t,
        title: buildTitle("supporter_count", t),
      });
    }
  }
  for (const t of DEFAULTS.totalRaisedPaisa) {
    if (!have.has(`total_raised:${t}`)) {
      toInsert.push({
        creatorId,
        kind: "total_raised",
        threshold: t,
        title: buildTitle("total_raised", t),
      });
    }
  }

  if (toInsert.length > 0) {
    await db.insert(milestones).values(toInsert);
  }
}

/**
 * After a tip is marked succeeded, check whether any unreached milestone
 * threshold has now been crossed and stamp `reachedAt`. Idempotent.
 */
export async function evaluateMilestonesForCreator(
  creatorId: string,
): Promise<void> {
  await ensureSeeded(creatorId);

  const [stats] = await db
    .select({
      totalRaisedPaisa: sql<number>`COALESCE(SUM(${tips.amountPaisa}), 0)::int`,
      supporterCount: countDistinct(tips.supporterEmail),
    })
    .from(tips)
    .where(and(eq(tips.creatorId, creatorId), eq(tips.status, "succeeded")));

  const totalRaisedPaisa = Number(stats?.totalRaisedPaisa ?? 0);
  const supporterCount = Number(stats?.supporterCount ?? 0);

  await db.transaction(async (tx) => {
    if (supporterCount > 0) {
      await tx
        .update(milestones)
        .set({ reachedAt: sql`now()` })
        .where(
          and(
            eq(milestones.creatorId, creatorId),
            eq(milestones.kind, "supporter_count"),
            lte(milestones.threshold, supporterCount),
            isNull(milestones.reachedAt),
          ),
        );
    }
    if (totalRaisedPaisa > 0) {
      await tx
        .update(milestones)
        .set({ reachedAt: sql`now()` })
        .where(
          and(
            eq(milestones.creatorId, creatorId),
            eq(milestones.kind, "total_raised"),
            lte(milestones.threshold, totalRaisedPaisa),
            isNull(milestones.reachedAt),
          ),
        );
    }
  });
}
