import "server-only";

import { redirect } from "next/navigation";

import { getCreatorByUserId } from "@/db/queries/creators";
import type { Creator } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";

/** Resolve the logged-in creator or bounce. Used by every shop server action. */
export async function requireCreator(): Promise<Creator> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const creator = await getCreatorByUserId(user.id);
  if (!creator) redirect("/onboarding/handle");
  if (creator.onboardingStep !== "done") {
    redirect(`/onboarding/${creator.onboardingStep}`);
  }
  return creator;
}
