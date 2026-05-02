import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { getCreatorByUserId } from "@/db/queries/creators";
import { type Creator } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";

export interface AuthedSession {
  user: User;
  creator: Creator;
}

/**
 * Data Access Layer entry point.
 *
 * Require a signed-in user with a fully onboarded creator row. Redirects to:
 *   - /login                  → not signed in
 *   - /onboarding/handle      → no creator row
 *   - /onboarding/{step}      → onboarding incomplete
 *
 * `cache()` memoizes the result for the duration of a single render pass —
 * calling `requireCreator()` from layout, page, and nested components issues
 * one Supabase + Drizzle round-trip, not three.
 *
 * Following the Next.js 16 authentication guide:
 *   "Do checks close to your data source or the component that'll be
 *    conditionally rendered."
 *
 * The proxy already redirects unauthenticated visitors at the edge for
 * defence-in-depth. This function is the authoritative check.
 */
export const requireCreator = cache(async (): Promise<AuthedSession> => {
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

  return { user, creator };
});

/** Soft variant: returns null instead of redirecting. Use only for surfaces that
 *  render for both authed and unauthed users (e.g. a public page that adapts). */
export const getAuthedSession = cache(
  async (): Promise<AuthedSession | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const creator = await getCreatorByUserId(user.id);
    if (!creator || creator.onboardingStep !== "done") return null;
    return { user, creator };
  },
);

/** Require an authenticated user but allow incomplete onboarding (used by the
 *  onboarding flow itself). */
export const requireUser = cache(async (): Promise<User> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
});

/**
 * Auth check for Server Actions. Returns `{ creator }` or `null`.
 *
 * Per Next.js 16 docs: "Treat Server Actions with the same security
 * considerations as public-facing API endpoints, and verify if the user is
 * allowed to perform a mutation."
 *
 * Actions should check the return value and respond with `{ ok: false }`
 * rather than redirecting, so the client sees a clean validation result.
 */
export async function getCreatorForAction(): Promise<{
  user: User;
  creator: Creator;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const creator = await getCreatorByUserId(user.id);
  if (!creator) return null;
  return { user, creator };
}
