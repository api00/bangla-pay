import { redirect } from "next/navigation";

import TipsList from "@/components/dashboard/tips/TipsList";
import { getCreatorByUserId } from "@/db/queries/creators";
import {
  getCreatorTipStats,
  listTipsForCreator,
} from "@/db/queries/tips";
import { formatTaka } from "@/lib/money";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Tips · BanglaPay",
};

export default async function DashboardTipsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const creator = await getCreatorByUserId(user.id);
  if (!creator) redirect("/onboarding/handle");

  const [stats, succeeded, pending, failed] = await Promise.all([
    getCreatorTipStats(creator.id),
    listTipsForCreator(creator.id, { status: "succeeded", limit: 50 }),
    listTipsForCreator(creator.id, { status: "pending", limit: 25 }),
    listTipsForCreator(creator.id, { status: "failed", limit: 25 }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <h1
            className="display text-[28px] md:text-[36px] text-[#0e0f0c]"
            style={{ lineHeight: 1.1, fontWeight: 700 }}
          >
            Tips
          </h1>
          <p className="text-[14px] text-[#454745] mt-1">
            One-off support from your community.
          </p>
        </div>
        <a
          href={`/${creator.handle}`}
          target="_blank"
          rel="noreferrer"
          className="text-[13px] font-semibold text-[#163300] underline underline-offset-4 decoration-[#9fe870] decoration-[2px] hover:decoration-[#cdffad]"
        >
          View public page →
        </a>
      </header>

      <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-white border border-[rgba(14,15,12,0.06)] px-5 py-4">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#868685]">
            Total raised
          </dt>
          <dd className="mt-1 text-[22px] font-semibold tabular-nums text-[#0e0f0c]">
            {formatTaka(stats.totalRaisedPaisa)}
          </dd>
        </div>
        <div className="rounded-2xl bg-white border border-[rgba(14,15,12,0.06)] px-5 py-4">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#868685]">
            Supporters
          </dt>
          <dd className="mt-1 text-[22px] font-semibold tabular-nums text-[#0e0f0c]">
            {stats.supporterCount}
          </dd>
        </div>
        <div className="rounded-2xl bg-white border border-[rgba(14,15,12,0.06)] px-5 py-4">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#868685]">
            Average tip
          </dt>
          <dd className="mt-1 text-[22px] font-semibold tabular-nums text-[#0e0f0c]">
            {stats.averageTipPaisa > 0
              ? formatTaka(stats.averageTipPaisa)
              : "—"}
          </dd>
        </div>
        <div className="rounded-2xl bg-white border border-[rgba(14,15,12,0.06)] px-5 py-4">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#868685]">
            Pending
          </dt>
          <dd className="mt-1 text-[22px] font-semibold tabular-nums text-[#0e0f0c]">
            {stats.pendingTipCount}
          </dd>
        </div>
      </dl>

      <TipsList
        title="Recent tips"
        tips={succeeded}
        emptyState="No paid tips yet. Share your page link to get the first one in."
      />

      {pending.length > 0 && (
        <TipsList
          title="Pending"
          tips={pending}
          emptyState="No pending tips."
        />
      )}

      {failed.length > 0 && (
        <TipsList
          title="Failed"
          tips={failed}
          emptyState="No failed tips."
        />
      )}
    </div>
  );
}
