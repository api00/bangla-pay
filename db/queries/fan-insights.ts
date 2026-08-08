import "server-only";

import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  creatorFanInsights,
  messages,
  type CreatorFanInsight,
} from "@/db/schema";

export interface FanMessageState {
  total: number;
  latestAt: Date | null;
}

/** Count and newest timestamp — together these decide whether a read is stale. */
export async function getFanMessageState(
  creatorId: string,
): Promise<FanMessageState> {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      // Typed loosely on purpose. A raw `sql` expression bypasses Drizzle's
      // timestamp mapper, so the driver hands back a string here even though
      // the column is timestamptz. Claiming `Date` would be a lie the
      // compiler believes and the runtime doesn't.
      latestAt: sql<string | Date | null>`max(${messages.createdAt})`,
    })
    .from(messages)
    .where(eq(messages.creatorId, creatorId));

  const raw = row?.latestAt ?? null;
  const latestAt =
    raw === null ? null : raw instanceof Date ? raw : new Date(raw);

  return {
    total: row?.total ?? 0,
    latestAt: latestAt && !Number.isNaN(latestAt.getTime()) ? latestAt : null,
  };
}

/** Most recent message bodies, newest first. */
export async function listFanMessageBodies(
  creatorId: string,
  limit: number,
): Promise<string[]> {
  const rows = await db
    .select({ body: messages.body })
    .from(messages)
    .where(eq(messages.creatorId, creatorId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
  return rows.map((row) => row.body);
}

export async function getLatestFanInsight(
  creatorId: string,
): Promise<CreatorFanInsight | null> {
  const [row] = await db
    .select()
    .from(creatorFanInsights)
    .where(eq(creatorFanInsights.creatorId, creatorId))
    .orderBy(desc(creatorFanInsights.createdAt))
    .limit(1);
  return row ?? null;
}

/**
 * Whether a stored insight still reflects the inbox.
 *
 * The newest message timestamp is the whole key. A count comparison looks
 * more thorough but breaks as soon as an inbox passes the analysis cap —
 * `messagesAnalysed` stops at 200 while the total keeps climbing, and every
 * check would then report stale forever.
 *
 * Messages are only ever added, so a newer timestamp is the one signal that
 * a re-read would actually produce a different answer.
 */
export function isInsightStale(
  insight: CreatorFanInsight | null,
  state: FanMessageState,
): boolean {
  if (!insight) return true;
  if (state.latestAt === null) return false;
  const storedAt = insight.latestMessageAt?.getTime() ?? null;
  return storedAt !== state.latestAt.getTime();
}
