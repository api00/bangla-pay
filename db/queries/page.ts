import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  creatorPages,
  tipPresets,
  type CreatorPage,
  type TipPreset,
} from "@/db/schema";

export async function getCreatorPage(
  creatorId: string,
): Promise<CreatorPage | null> {
  const rows = await db
    .select()
    .from(creatorPages)
    .where(eq(creatorPages.creatorId, creatorId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getTipPresetsForCreator(
  creatorId: string,
): Promise<TipPreset[]> {
  return db
    .select()
    .from(tipPresets)
    .where(eq(tipPresets.creatorId, creatorId))
    .orderBy(tipPresets.position);
}
