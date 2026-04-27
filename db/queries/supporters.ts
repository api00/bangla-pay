import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { supporters, type Supporter } from "@/db/schema";

/**
 * Idempotent: returns an existing supporter row by email, otherwise creates
 * one. Updates `displayName` when a non-null name is provided and the row
 * was previously nameless. Refreshes `lastSeenAt`.
 *
 * Server-only — supporters table is service-role for writes.
 */
export async function upsertSupporterByEmail(
  email: string,
  displayName: string | null,
): Promise<Supporter> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error("Email is required.");

  const existing = await db
    .select()
    .from(supporters)
    .where(eq(supporters.email, normalizedEmail))
    .limit(1);

  if (existing[0]) {
    const row = existing[0];
    const shouldUpdateName = displayName && !row.displayName;
    const updated = await db
      .update(supporters)
      .set({
        displayName: shouldUpdateName ? displayName : row.displayName,
        lastSeenAt: sql`now()`,
      })
      .where(eq(supporters.id, row.id))
      .returning();
    return updated[0] ?? row;
  }

  const inserted = await db
    .insert(supporters)
    .values({ email: normalizedEmail, displayName })
    .returning();
  if (!inserted[0]) {
    throw new Error("Failed to upsert supporter.");
  }
  return inserted[0];
}
