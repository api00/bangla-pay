import "server-only";

import { and, asc, desc, eq, isNotNull, ne, or, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  creatorPages,
  creators,
  orders,
  products,
  tips,
  type Creator,
} from "@/db/schema";

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

export interface DirectoryCreator {
  handle: string;
  displayName: string;
  category: Creator["category"];
  bio: string | null;
  avatarUrl: string | null;
  themeColor: string;
  liveProducts: number;
  supporters: number;
}

/**
 * Creators shown in the public directory.
 *
 * Deliberately not "everyone who signed up": a creator appears once they have
 * a bio or an avatar. An empty card is worse than no card, and a directory of
 * blank placeholders makes the whole platform look abandoned. Finishing a
 * profile is what earns the listing.
 *
 * Ordered by the creators who have actually shipped something, so the top of
 * the page is always the strongest example of what BanglaPay is for.
 */
export async function listDirectoryCreators(
  limit = 60,
  category?: Creator["category"],
): Promise<DirectoryCreator[]> {
  const liveProducts = sql<number>`(
    select count(*)::int from ${products}
    where ${products.creatorId} = ${creators.id}
      and ${products.isPublished} = true
  )`;
  const supporters = sql<number>`(
    SELECT COUNT(*)::int
    FROM (
      SELECT COALESCE(
        CASE WHEN NULLIF(TRIM(${tips.supporterEmail}), '') IS NOT NULL
          THEN 'email:' || LOWER(TRIM(${tips.supporterEmail})) END,
        CASE WHEN ${tips.supporterId} IS NOT NULL
          THEN 'supporter:' || ${tips.supporterId}::text END,
        CASE WHEN NULLIF(TRIM(${tips.supporterName}), '') IS NOT NULL
          THEN 'name:' || LOWER(TRIM(${tips.supporterName})) END,
        'tip:' || ${tips.id}::text
      ) AS supporter_key
      FROM ${tips}
      WHERE ${tips.creatorId} = ${creators.id}
        AND ${tips.status} = 'succeeded'

      UNION

      SELECT COALESCE(
        CASE WHEN NULLIF(TRIM(${orders.supporterEmail}), '') IS NOT NULL
          THEN 'email:' || LOWER(TRIM(${orders.supporterEmail})) END,
        CASE WHEN ${orders.supporterId} IS NOT NULL
          THEN 'supporter:' || ${orders.supporterId}::text END,
        'order:' || ${orders.id}::text
      ) AS supporter_key
      FROM ${orders}
      WHERE ${orders.creatorId} = ${creators.id}
        AND ${orders.status} = 'paid'
    ) AS creator_supporters
  )`;

  const rows = await db
    .select({
      handle: creators.handle,
      displayName: creators.displayName,
      category: creators.category,
      bio: creatorPages.bio,
      avatarUrl: creatorPages.avatarUrl,
      themeColor: creatorPages.themeColor,
      liveProducts,
      supporters,
    })
    .from(creators)
    .innerJoin(creatorPages, eq(creatorPages.creatorId, creators.id))
    .where(
      and(
        eq(creators.onboardingStep, "done"),
        category ? eq(creators.category, category) : undefined,
        // "Ready" = has something to show.
        or(
          and(isNotNull(creatorPages.bio), ne(creatorPages.bio, "")),
          isNotNull(creatorPages.avatarUrl),
        ),
      ),
    )
    .orderBy(desc(liveProducts), desc(supporters), asc(creators.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    themeColor: row.themeColor ?? "#9fe870",
    liveProducts: Number(row.liveProducts ?? 0),
    supporters: Number(row.supporters ?? 0),
  }));
}
