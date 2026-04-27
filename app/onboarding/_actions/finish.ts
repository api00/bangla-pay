"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { getCreatorByUserId } from "@/db/queries/creators";
import { creators } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";

/**
 * Server Action: marks onboarding as `done`. Payout method is optional in v1
 * — creators can request payouts only after adding one (Phase 8 enforces that).
 */
export async function finishOnboarding(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const creator = await getCreatorByUserId(user.id);
  if (!creator) redirect("/onboarding/handle");

  await db
    .update(creators)
    .set({ onboardingStep: "done", updatedAt: new Date() })
    .where(eq(creators.id, creator.id));

  redirect("/dashboard");
}
