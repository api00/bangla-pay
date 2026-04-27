import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import { getCreatorByUserId } from "@/db/queries/creators";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Set up your page · BanglaPay",
};

const STEP_TO_PATH = {
  handle: "/onboarding/handle",
  profile: "/onboarding/profile",
  payout: "/onboarding/payout",
} as const;

/**
 * Gates all `/onboarding/*` routes:
 *   - no auth        → /login (the proxy already does this; double-check here)
 *   - no creator row → /onboarding/handle
 *   - step != current path → redirect to the path matching their step
 *   - step === 'done' → /dashboard
 */
export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const headerList = await headers();
  const pathname = headerList.get("x-banglapay-pathname") ?? "";

  const creator = await getCreatorByUserId(user.id);

  if (!creator) {
    if (pathname !== STEP_TO_PATH.handle) redirect(STEP_TO_PATH.handle);
    return <>{children}</>;
  }

  if (creator.onboardingStep === "done") {
    redirect("/dashboard");
  }

  const expectedPath = STEP_TO_PATH[creator.onboardingStep];
  if (pathname !== expectedPath) {
    redirect(expectedPath);
  }

  return <>{children}</>;
}
