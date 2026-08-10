import EmptyState from "@/components/dashboard/EmptyState";
import { PeopleIcon } from "@/components/dashboard/icons";
import PageHeader from "@/components/dashboard/PageHeader";
import SupportersTable from "@/components/dashboard/supporters/SupportersTable";
import {
  getCreatorSupporterStats,
  listSupportersForCreator,
} from "@/db/queries/dashboard-supporters";
import { requireCreator } from "@/lib/auth";
import { formatTaka } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Supporters · BanglaPay" };

export default async function DashboardSupportersPage() {
  const { creator } = await requireCreator();

  const [supporters, stats] = await Promise.all([
    listSupportersForCreator(creator.id, 200),
    getCreatorSupporterStats(creator.id),
  ]);

  const topSupporter = supporters[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supporters"
        subtitle="Everyone who's tipped you or bought from your shop, sorted by total support."
      />

      <dl className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Supporters" value={String(stats.supporterCount)} />
        <Stat
          label="Total contributed"
          value={formatTaka(stats.totalContributedPaisa)}
        />
        <Stat
          label="Top supporter"
          value={
            topSupporter
              ? formatTaka(topSupporter.totalPaisa)
              : "—"
          }
          sub={
            topSupporter
              ? topSupporter.displayName?.trim() ||
                topSupporter.email ||
                "Anonymous"
              : undefined
          }
        />
      </dl>

      {supporters.length === 0 ? (
        <EmptyState
          icon={<PeopleIcon width={22} height={22} />}
          title="No supporters yet"
          body="When someone tips you or buys from your shop, they'll show up here. Share your page to get the first one in."
        />
      ) : (
        <SupportersTable supporters={supporters} />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-[rgba(14,15,12,0.06)] px-5 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray">
        {label}
      </div>
      <div className="mt-1 text-[22px] font-semibold tabular-nums text-near-black">
        {value}
      </div>
      {sub && (
        <div className="text-[12px] text-gray mt-0.5 truncate">{sub}</div>
      )}
    </div>
  );
}
