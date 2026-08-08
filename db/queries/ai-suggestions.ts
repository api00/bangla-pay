import "server-only";

import { and, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  productAiSuggestions,
  products,
  type ProductAiSuggestion,
} from "@/db/schema";

/**
 * The cached result for a file, if we've already read it.
 *
 * Only `ok` rows count as a cache hit — a previous failure was probably
 * transient and shouldn't poison every later attempt.
 */
export async function getCachedSuggestion(
  productFileId: string,
): Promise<ProductAiSuggestion | null> {
  const [row] = await db
    .select()
    .from(productAiSuggestions)
    .where(
      and(
        eq(productAiSuggestions.productFileId, productFileId),
        eq(productAiSuggestions.status, "ok"),
      ),
    )
    .orderBy(desc(productAiSuggestions.createdAt))
    .limit(1);
  return row ?? null;
}

/**
 * How many analyses this creator has run since `since`.
 *
 * Counted across their products rather than per product, because the cost is
 * per request and a creator can make unlimited products.
 */
export async function countRecentAnalyses(
  creatorId: string,
  since: Date,
): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(productAiSuggestions)
    .innerJoin(products, eq(products.id, productAiSuggestions.productId))
    .where(
      and(
        eq(products.creatorId, creatorId),
        gte(productAiSuggestions.createdAt, since),
      ),
    );
  return row?.total ?? 0;
}
