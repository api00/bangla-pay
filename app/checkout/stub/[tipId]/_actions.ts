"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { evaluateMilestonesForCreator } from "@/db/queries/milestone-eval";
import { upsertSupporterByEmail } from "@/db/queries/supporters";
import { creators, messages, tips } from "@/db/schema";

interface StubCheckoutInput {
  tipId: string;
  /** Optional supporter email — Phase 4 doesn't collect it on the form;
   *  Phase 5 will via provider response. Treated as nullable here. */
  supporterEmail?: string;
}

/**
 * Stub success: flips the tip to `succeeded`, sets paid_at, optionally upserts
 * a supporters row and creates a messages row when there's a tip message.
 *
 * Phase 5 replaces this with the webhook handler — same effect, different trigger.
 */
export async function markTipPaid({
  tipId,
  supporterEmail,
}: StubCheckoutInput): Promise<void> {
  const [tip] = await db
    .select()
    .from(tips)
    .where(eq(tips.id, tipId))
    .limit(1);

  if (!tip) redirect("/");

  // Idempotent: if already succeeded, just bounce to the creator page.
  if (tip.status === "succeeded") {
    const [creator] = await db
      .select({ handle: creators.handle })
      .from(creators)
      .where(eq(creators.id, tip.creatorId))
      .limit(1);
    redirect(creator ? `/${creator.handle}` : "/");
  }

  if (tip.status !== "pending") {
    // Failed/refunded tips can't be retried this way.
    redirect("/");
  }

  const email = supporterEmail?.trim() || tip.supporterEmail || null;
  let supporterId: string | null = tip.supporterId;
  if (email) {
    const supporter = await upsertSupporterByEmail(email, tip.supporterName);
    supporterId = supporter.id;
  }

  await db.transaction(async (tx) => {
    await tx
      .update(tips)
      .set({
        status: "succeeded",
        paidAt: new Date(),
        supporterId,
        supporterEmail: email,
      })
      .where(and(eq(tips.id, tipId), eq(tips.status, "pending")));

    if (tip.message) {
      await tx.insert(messages).values({
        creatorId: tip.creatorId,
        kind: "tip",
        tipId: tip.id,
        supporterName: tip.supporterName,
        supporterEmail: email,
        body: tip.message,
      });
    }
  });

  await evaluateMilestonesForCreator(tip.creatorId);

  const [creator] = await db
    .select({ handle: creators.handle })
    .from(creators)
    .where(eq(creators.id, tip.creatorId))
    .limit(1);

  if (creator?.handle) {
    revalidatePath(`/${creator.handle}`);
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tips");
  revalidatePath("/dashboard/supporters");
  revalidatePath("/dashboard/messages");

  redirect(`/checkout/success?tip=${tip.id}`);
}

export async function markTipFailed({
  tipId,
}: StubCheckoutInput): Promise<void> {
  await db
    .update(tips)
    .set({ status: "failed" })
    .where(and(eq(tips.id, tipId), eq(tips.status, "pending")));

  const [tip] = await db
    .select({ creatorId: tips.creatorId })
    .from(tips)
    .where(eq(tips.id, tipId))
    .limit(1);
  if (!tip) redirect("/");

  const [creator] = await db
    .select({ handle: creators.handle })
    .from(creators)
    .where(eq(creators.id, tip.creatorId))
    .limit(1);
  redirect(creator ? `/${creator.handle}` : "/");
}
