import { redirect } from "next/navigation";

import PageHeader from "@/components/dashboard/PageHeader";
import ProfileForm from "@/components/dashboard/settings/profile/ProfileForm";
import PresetsForm from "@/components/dashboard/settings/profile/PresetsForm";
import { getCreatorPage, getTipPresetsForCreator } from "@/db/queries/page";
import { requireCreator } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile · Settings · BanglaPay" };

export default async function ProfileSettingsPage() {
  const { creator } = await requireCreator();

  const [page, presets] = await Promise.all([
    getCreatorPage(creator.id),
    getTipPresetsForCreator(creator.id),
  ]);

  if (!page) {
    // Should be created by onboarding. If not, redirect back.
    redirect("/onboarding/handle");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile & page"
        subtitle="What supporters see on your public page."
        action={
          <a
            href={`/${creator.handle}`}
            target="_blank"
            rel="noreferrer"
            className="text-[13px] font-semibold text-[#163300] underline underline-offset-4 decoration-[#9fe870] decoration-[2px] hover:decoration-[#cdffad]"
          >
            View public page →
          </a>
        }
      />

      <ProfileForm creator={creator} page={page} />
      <PresetsForm presets={presets} />
    </div>
  );
}
