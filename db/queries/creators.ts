import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { creators, type Creator } from "@/db/schema";

/** Fetch creator by their Supabase auth user id. Returns `null` if not onboarded. */
export async function getCreatorByUserId(
  userId: string,
): Promise<Creator | null> {
  const rows = await db
    .select()
    .from(creators)
    .where(eq(creators.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

/** Public profile lookup by handle. Returns `null` if no creator owns the handle. */
export async function getCreatorByHandle(
  handle: string,
): Promise<Creator | null> {
  const rows = await db
    .select()
    .from(creators)
    .where(eq(creators.handle, handle))
    .limit(1);
  return rows[0] ?? null;
}

/** Cheap exists check used by the live availability lookup during onboarding. */
export async function handleIsTaken(handle: string): Promise<boolean> {
  const rows = await db
    .select({ id: creators.id })
    .from(creators)
    .where(eq(creators.handle, handle))
    .limit(1);
  return rows.length > 0;
}
