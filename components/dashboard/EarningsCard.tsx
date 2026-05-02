import Link from "next/link";

import type { DailyActivity } from "@/db/queries/activity";
import { formatTaka, formatTakaCompact } from "@/lib/money";

import Sparkline from "./Sparkline";

interface EarningsCardProps {
  totalRaisedPaisa: number;
  succeededTipCount: number;
  averageTipPaisa: number;
  daily: DailyActivity[];
}

export default function EarningsCard({
  totalRaisedPaisa,
  succeededTipCount,
  averageTipPaisa,
  daily,
}: EarningsCardProps) {
  const display =
    totalRaisedPaisa >= 100_00_00
      ? formatTakaCompact(totalRaisedPaisa)
      : formatTaka(totalRaisedPaisa);

  return (
    <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7 shadow-[0_1px_0_0_rgba(14,15,12,0.03)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[17px] font-bold tracking-tight text-[#0e0f0c]">
          Earnings
        </h2>
        <Link
          href="/dashboard/tips"
          className="text-[13px] font-semibold text-[#454745] hover:text-[#0e0f0c]"
        >
          View tips →
        </Link>
      </div>

      <div className="mt-6">
        <div
          className="display text-[44px] md:text-[56px] tabular-nums text-[#0e0f0c]"
          style={{ lineHeight: 1, fontWeight: 700 }}
        >
          {display}
        </div>
        <div className="mt-3 text-[13px] text-[#454745]">
          Lifetime tips received.
        </div>
      </div>

      <div className="mt-5">
        <Sparkline data={daily} />
      </div>

      <div className="mt-5 pt-5 border-t border-[rgba(14,15,12,0.06)] grid grid-cols-2 gap-4">
        <div>
          <div className="text-[12px] font-semibold text-[#868685] uppercase tracking-[0.14em]">
            Tips
          </div>
          <div className="text-[18px] font-bold tabular-nums text-[#0e0f0c] mt-1">
            {succeededTipCount}
          </div>
        </div>
        <div>
          <div className="text-[12px] font-semibold text-[#868685] uppercase tracking-[0.14em]">
            Average
          </div>
          <div className="text-[18px] font-bold tabular-nums text-[#0e0f0c] mt-1">
            {averageTipPaisa > 0 ? formatTaka(averageTipPaisa) : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
