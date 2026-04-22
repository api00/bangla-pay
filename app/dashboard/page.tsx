import ProfileCard from "@/components/dashboard/ProfileCard";
import EarningsCard from "@/components/dashboard/EarningsCard";
import StatsGrid from "@/components/dashboard/StatsGrid";
import SetupBanner from "@/components/dashboard/SetupBanner";
import GettingStarted from "@/components/dashboard/GettingStarted";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <ProfileCard />

      <SetupBanner />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <EarningsCard />
        <RecentActivity />
      </div>

      <StatsGrid />

      <GettingStarted />
    </div>
  );
}
