"use client";

import { useTransition } from "react";

import { cancelPayout } from "@/app/dashboard/settings/payouts/_actions";
import Card from "@/components/dashboard/settings/Card";
import type { Payout } from "@/db/schema";
import { formatBdtDate, formatBdtDateTime } from "@/lib/dates";
import { formatTaka } from "@/lib/money";

const STATUS_STYLE: Record<
  Payout["status"],
  { label: string; bg: string; fg: string }
> = {
  requested: {
    label: "Requested",
    bg: "bg-warning-surface",
    fg: "text-warning-ink",
  },
  processing: {
    label: "Processing",
    bg: "bg-[#e8e1ff]",
    fg: "text-[#3f2b8c]",
  },
  settled: {
    label: "Settled",
    bg: "bg-light-mint",
    fg: "text-dark-green",
  },
  failed: {
    label: "Failed",
    bg: "bg-danger-surface",
    fg: "text-heritage-red-ink",
  },
};

interface PayoutHistoryProps {
  payouts: Payout[];
}

export default function PayoutHistory({ payouts }: PayoutHistoryProps) {
  const [isPending, startTransition] = useTransition();

  if (payouts.length === 0) {
    return null;
  }

  return (
    <Card title="Payout history" description="Past and pending withdrawals.">
      <ul className="divide-y divide-[rgba(14,15,12,0.05)]">
        {payouts.map((p) => {
          const style = STATUS_STYLE[p.status];
          return (
            <li
              key={p.id}
              className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 flex-wrap"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[15px] font-semibold tabular-nums text-near-black">
                    {formatTaka(p.amountPaisa)}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded-full ${style.bg} ${style.fg}`}
                  >
                    {style.label}
                  </span>
                </div>
                <div className="text-[12px] text-gray mt-1 tabular-nums">
                  Requested {formatBdtDateTime(p.requestedAt)}
                  {p.settledAt && (
                    <> · Settled {formatBdtDate(p.settledAt)}</>
                  )}
                </div>
                {p.failureReason && (
                  <div className="text-[12px] text-heritage-red-ink mt-1">
                    {p.failureReason}
                  </div>
                )}
              </div>
              {p.status === "requested" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (window.confirm("Cancel this payout request?")) {
                      startTransition(async () => {
                        await cancelPayout(p.id);
                      });
                    }
                  }}
                  className="text-[13px] font-semibold text-warm-dark hover:text-heritage-red-ink h-9 px-3 rounded-full hover:bg-danger-surface transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
