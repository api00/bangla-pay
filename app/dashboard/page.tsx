import { redirect } from "next/navigation";

import EarningsCard from "@/components/dashboard/EarningsCard";
import GettingStarted from "@/components/dashboard/GettingStarted";
import ProfileCard from "@/components/dashboard/ProfileCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SetupBanner from "@/components/dashboard/SetupBanner";
import StatsGrid from "@/components/dashboard/StatsGrid";
import { getCreatorByUserId } from "@/db/queries/creators";
import {
  getCreatorTipStats,
  recentSucceededTips,
} from "@/db/queries/tips";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

function deriveInitials(displayName: string): string {
  return (
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const creator = await getCreatorByUserId(user.id);
  if (!creator) redirect("/onboarding/handle");

  const [stats, recent] = await Promise.all([
    getCreatorTipStats(creator.id),
    recentSucceededTips(creator.id, 5),
  ]);

  return (
    <div className="space-y-6">
      <ProfileCard
        displayName={creator.displayName}
        handle={creator.handle}
        initials={deriveInitials(creator.displayName)}
      />

      <SetupBanner />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <EarningsCard
          totalRaisedPaisa={stats.totalRaisedPaisa}
          succeededTipCount={stats.succeededTipCount}
          averageTipPaisa={stats.averageTipPaisa}
        />
        <RecentActivity tips={recent} />
      </div>

      <StatsGrid
        supporterCount={stats.supporterCount}
        pendingTipCount={stats.pendingTipCount}
        averageTipPaisa={stats.averageTipPaisa}
      />

      <GettingStarted />
    </div>
  );
}
