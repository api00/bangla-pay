import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { getCreatorByUserId } from "@/db/queries/creators";
import { creatorPages } from "@/db/schema";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import ProfileForm from "@/components/onboarding/ProfileForm";
import { SITE_HOST } from "@/lib/site";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Set up your profile · BanglaPay",
};

export default async function OnboardingProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const creator = await getCreatorByUserId(user.id);
  if (!creator) redirect("/onboarding/handle");

  const pageRows = await db
    .select({ bio: creatorPages.bio })
    .from(creatorPages)
    .where(eq(creatorPages.creatorId, creator.id))
    .limit(1);

  return (
    <OnboardingLayout
      step="profile"
      title={
        <>
          Tell supporters who <span className="text-[#163300]">you are</span>.
        </>
      }
      subtitle="A short, friendly profile makes the difference between a tip and a scroll."
      aside={
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#868685] mb-4">
            Your page so far
          </p>
          <div className="rounded-2xl border border-[rgba(14,15,12,0.08)] bg-white p-5">
            <p className="text-[12px] text-[#868685]">{SITE_HOST}</p>
            <p className="text-[20px] font-semibold text-[#0e0f0c]">
              /{creator.handle}
            </p>
            <p className="mt-3 text-[14px] text-[#454745] leading-[1.5]">
              Your handle is locked in. Now make it feel like yours.
            </p>
          </div>
        </div>
      }
    >
      <ProfileForm
        defaultDisplayName={creator.displayName}
        defaultCategory={creator.category}
        defaultBio={pageRows[0]?.bio ?? ""}
      />
    </OnboardingLayout>
  );
}
