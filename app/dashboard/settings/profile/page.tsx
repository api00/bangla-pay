import { redirect } from "next/navigation";

import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/settings/Card";
import CreatorImageUploader from "@/components/dashboard/settings/profile/CreatorImageUploader";
import PresetsForm from "@/components/dashboard/settings/profile/PresetsForm";
import ProfileForm from "@/components/dashboard/settings/profile/ProfileForm";
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
            className="text-[13px] font-semibold text-dark-green underline underline-offset-4 decoration-wise-green decoration-[2px] hover:decoration-pastel-green"
          >
            View public page →
          </a>
        }
      />

      <Card
        title="Profile picture & cover"
        description="Upload from your computer. Saves automatically."
      >
        <div className="grid gap-7 md:grid-cols-[auto_1fr] md:items-start">
          <CreatorImageUploader
            kind="avatar"
            label="Profile picture"
            hint="Square image works best. JPEG, PNG, WebP, GIF, AVIF — up to 5 MB."
            shape="square"
            initialUrl={page.avatarUrl}
          />
          <CreatorImageUploader
            kind="cover"
            label="Cover image"
            hint="Wide image, 1200×400 looks great. Up to 5 MB."
            shape="wide"
            initialUrl={page.coverUrl}
          />
        </div>
      </Card>

      <ProfileForm creator={creator} page={page} />
      <PresetsForm presets={presets} />
    </div>
  );
}
