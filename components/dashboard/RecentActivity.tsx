import Link from "next/link";

import type { Tip } from "@/db/schema";
import { formatTaka } from "@/lib/money";

interface RecentActivityProps {
  tips: Tip[];
}

const RELATIVE_TIME = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return RELATIVE_TIME.format(-Math.floor(diff / 60), "minute");
  if (diff < 86_400)
    return RELATIVE_TIME.format(-Math.floor(diff / 3_600), "hour");
  if (diff < 7 * 86_400)
    return RELATIVE_TIME.format(-Math.floor(diff / 86_400), "day");
  return RELATIVE_TIME.format(-Math.floor(diff / (7 * 86_400)), "week");
}

function initialOf(name: string | null): string {
  if (!name) return "?";
  return name.trim()[0]?.toUpperCase() ?? "?";
}

export default function RecentActivity({ tips }: RecentActivityProps) {
  return (
    <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7 shadow-[0_1px_0_0_rgba(14,15,12,0.03)]">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[17px] font-bold tracking-tight text-near-black">
          Recent activity
        </h2>
        <Link
          href="/dashboard/tips"
          className="text-[13px] font-semibold text-warm-dark hover:text-near-black"
        >
          View all →
        </Link>
      </div>

      {tips.length === 0 ? (
        <p className="text-[13px] text-gray leading-[1.55]">
          No tips yet. Share your page to get the first one in.
        </p>
      ) : (
        <ul className="divide-y divide-[rgba(14,15,12,0.05)]">
          {tips.map((tip) => {
            const supporter = tip.supporterName?.trim() || "Anonymous";
            return (
              <li
                key={tip.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pastel-green to-light-mint flex items-center justify-center shrink-0">
                  <span className="text-[13px] font-semibold text-dark-green">
                    {initialOf(tip.supporterName)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-near-black truncate">
                    {supporter}
                  </div>
                  <div className="text-[12px] text-gray truncate">
                    {tip.message
                      ? `“${tip.message}”`
                      : `Sent ${tip.chaCount ? `${tip.chaCount} cha` : "a tip"}`}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[14px] font-bold tabular-nums text-dark-green">
                    +{formatTaka(tip.amountPaisa)}
                  </div>
                  <div className="text-[11px] text-gray tabular-nums mt-0.5">
                    {timeAgo(tip.createdAt)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
