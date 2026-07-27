import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CreatorHeader from "@/components/creator-page/CreatorHeader";
import CreatorPageFooter from "@/components/creator-page/CreatorPageFooter";
import CreatorStats from "@/components/creator-page/CreatorStats";
import MilestoneBadges from "@/components/creator-page/MilestoneBadges";
import ShopPreview from "@/components/creator-page/ShopPreview";
import SupporterWall from "@/components/creator-page/SupporterWall";
import TipJar from "@/components/creator-page/TipJar";
import { listPublicReachedMilestones } from "@/db/queries/milestones";
import { listPublishedProducts } from "@/db/queries/products";
import { getPublicProfile } from "@/db/queries/profile";
import { normalizeHandle, RESERVED_HANDLES } from "@/lib/handle";
import { creatorUrl } from "@/lib/site";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle: rawHandle } = await params;
  const handle = normalizeHandle(rawHandle);
  if (!handle || RESERVED_HANDLES.has(handle)) return {};

  const profile = await getPublicProfile(handle);
  if (!profile) return {};

  const { creator, page } = profile;
  const description =
    page.bio ?? `Support ${creator.displayName} on BanglaPay.`;
  return {
    title: `${creator.displayName} (@${creator.handle}) · BanglaPay`,
    description,
    openGraph: {
      title: `${creator.displayName} on BanglaPay`,
      description,
      type: "profile",
      url: creatorUrl(creator.handle),
    },
  };
}

export default async function PublicCreatorPage({ params }: PageProps) {
  const { handle: rawHandle } = await params;
  const handle = normalizeHandle(rawHandle);

  // Reserved paths should never reach this catch-all in practice (Next route
  // precedence handles `/login`, `/dashboard`, etc. first), but guard for any
  // app-route name that hasn't been wired yet.
  if (!handle || RESERVED_HANDLES.has(handle)) notFound();

  const profile = await getPublicProfile(handle);
  if (!profile) notFound();

  const { creator, page, presets, supporters, totalRaisedPaisa, supporterCount } =
    profile;

  const [allProducts, milestones] = await Promise.all([
    listPublishedProducts(creator.id),
    listPublicReachedMilestones(creator.id),
  ]);
  const previewProducts = allProducts.slice(0, 4);

  return (
    <main className="min-h-screen bg-off-white">
      <div className="max-w-[680px] mx-auto px-5 sm:px-6 py-10 md:py-14 space-y-10">
        <CreatorHeader creator={creator} page={page} />
        <CreatorStats
          totalRaisedPaisa={totalRaisedPaisa}
          supporterCount={supporterCount}
          showTotalRaised={page.showTotalRaised}
          showSupporters={page.showSupporters}
          bnNumerals={page.bnNumerals}
        />
        <TipJar
          handle={creator.handle}
          displayName={creator.displayName}
          themeColor={page.themeColor}
          chaLabel={page.chaLabel}
          chaEmoji={page.chaEmoji}
          chaUnitPaisa={page.chaUnitPaisa}
          bnNumerals={page.bnNumerals}
          presets={presets}
        />
        <MilestoneBadges
          milestones={milestones}
          bnNumerals={page.bnNumerals}
        />
        {page.showSupporters && (
          <SupporterWall
            supporters={supporters}
            bnNumerals={page.bnNumerals}
          />
        )}
        <ShopPreview
          handle={creator.handle}
          displayName={creator.displayName}
          products={previewProducts}
        />
        <CreatorPageFooter />
      </div>
    </main>
  );
}
