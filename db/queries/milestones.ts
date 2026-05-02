import "server-only";

import { and, desc, eq, isNotNull } from "drizzle-orm";

import { db } from "@/db";
import { milestones, type Milestone } from "@/db/schema";

export async function listMilestonesForCreator(
  creatorId: string,
): Promise<Milestone[]> {
  return db
    .select()
    .from(milestones)
    .where(eq(milestones.creatorId, creatorId))
    .orderBy(desc(milestones.threshold));
}

export async function listPublicReachedMilestones(
  creatorId: string,
): Promise<Milestone[]> {
  return db
    .select()
    .from(milestones)
    .where(
      and(
        eq(milestones.creatorId, creatorId),
        eq(milestones.isPublic, true),
        isNotNull(milestones.reachedAt),
      ),
    )
    .orderBy(desc(milestones.reachedAt));
}
