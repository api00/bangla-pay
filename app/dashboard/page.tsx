import EarningsCard from "@/components/dashboard/EarningsCard";
import FanInsightsCard from "@/components/dashboard/FanInsightsCard";
import GettingStarted from "@/components/dashboard/GettingStarted";
import MilestonesCard from "@/components/dashboard/MilestonesCard";
import ProfileCard from "@/components/dashboard/ProfileCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SetupBanner from "@/components/dashboard/SetupBanner";
import StatsGrid from "@/components/dashboard/StatsGrid";
import { getDailyActivity } from "@/db/queries/activity";
import {
  getFanMessageState,
  getLatestFanInsight,
  isInsightStale,
} from "@/db/queries/fan-insights";
import { listMilestonesForCreator } from "@/db/queries/milestones";
import { getCreatorPage } from "@/db/queries/page";
import {
  getCreatorBalance,
  listPayoutMethods,
} from "@/db/queries/payouts";
import { getCreatorShopStats } from "@/db/queries/shop-stats";
import {
  getCreatorTipStats,
  recentSucceededTips,
} from "@/db/queries/tips";
import { MIN_MESSAGES_FOR_INSIGHT } from "@/lib/ai/fan-insights";
import { requireCreator } from "@/lib/auth";

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
  const { creator } = await requireCreator();

  const [
    stats,
    recent,
    daily,
    page,
    payoutMethods,
    balance,
    milestones,
    shopStats,
    fanInsight,
    fanMessageState,
  ] = await Promise.all([
    getCreatorTipStats(creator.id),
    recentSucceededTips(creator.id, 5),
    getDailyActivity(creator.id, 30),
    getCreatorPage(creator.id),
    listPayoutMethods(creator.id),
    getCreatorBalance(creator.id),
    listMilestonesForCreator(creator.id),
    getCreatorShopStats(creator.id),
    getLatestFanInsight(creator.id),
    getFanMessageState(creator.id),
  ]);

  const hasPayoutMethod = payoutMethods.length > 0;
  const hasBio = Boolean(page?.bio?.trim());
  const hasAvatar = Boolean(page?.avatarUrl);
  const hasFirstTip = stats.succeededTipCount > 0;

  return (
    <div className="space-y-6">
      <ProfileCard
        displayName={creator.displayName}
        handle={creator.handle}
        initials={deriveInitials(creator.displayName)}
      />

      <SetupBanner
        hasPayoutMethod={hasPayoutMethod}
        availablePaisa={balance.availablePaisa}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <EarningsCard
          totalRaisedPaisa={stats.totalRaisedPaisa}
          succeededTipCount={stats.succeededTipCount}
          averageTipPaisa={stats.averageTipPaisa}
          daily={daily}
        />
        <RecentActivity tips={recent} />
      </div>

      <StatsGrid
        supporterCount={stats.supporterCount}
        pendingTipCount={stats.pendingTipCount}
        averageTipPaisa={stats.averageTipPaisa}
        paidOrderCount={shopStats.paidOrderCount}
        shopRevenuePaisa={shopStats.shopRevenuePaisa}
      />

      <FanInsightsCard
        insight={fanInsight}
        messageCount={fanMessageState.total}
        isStale={isInsightStale(fanInsight, fanMessageState)}
        minMessages={MIN_MESSAGES_FOR_INSIGHT}
      />

      {milestones.length > 0 && <MilestonesCard milestones={milestones} />}

      <GettingStarted
        handle={creator.handle}
        hasBio={hasBio}
        hasAvatar={hasAvatar}
        hasPayoutMethod={hasPayoutMethod}
        hasFirstTip={hasFirstTip}
      />
    </div>
  );
}
