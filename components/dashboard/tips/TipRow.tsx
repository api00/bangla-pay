import type { Tip } from "@/db/schema";
import { formatTaka } from "@/lib/money";

interface TipRowProps {
  tip: Tip;
}

const STATUS_STYLES: Record<
  Tip["status"],
  { label: string; className: string }
> = {
  succeeded: {
    label: "Paid",
    className: "bg-light-mint text-dark-green",
  },
  pending: {
    label: "Pending",
    className: "bg-warning-surface text-warning-ink",
  },
  failed: {
    label: "Failed",
    className: "bg-danger-surface text-heritage-red-ink",
  },
  refunded: {
    label: "Refunded",
    className: "bg-light-surface text-warm-dark",
  },
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-BD", {
  dateStyle: "medium",
  timeStyle: "short",
});

function initialOf(name: string | null): string {
  if (!name) return "?";
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed[0]?.toUpperCase() ?? "?";
}

export default function TipRow({ tip }: TipRowProps) {
  const status = STATUS_STYLES[tip.status];
  const supporter = tip.supporterName?.trim() || "Anonymous";
  return (
    <li className="grid grid-cols-[40px_1fr_auto] gap-4 py-4 first:pt-0 last:pb-0 border-b border-[rgba(14,15,12,0.05)] last:border-0">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pastel-green to-light-mint flex items-center justify-center shrink-0">
        <span className="text-[13px] font-semibold text-dark-green">
          {initialOf(tip.supporterName)}
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-semibold text-near-black truncate">
            {supporter}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-full ${status.className}`}
          >
            {status.label}
          </span>
        </div>
        {tip.message && (
          <p className="text-[13px] text-warm-dark mt-1 leading-[1.55] line-clamp-2">
            {tip.message}
          </p>
        )}
        <p className="text-[11px] text-gray mt-1 tabular-nums">
          {DATE_FORMATTER.format(tip.createdAt)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[15px] font-semibold tabular-nums text-near-black">
          {tip.status === "succeeded" ? "+" : ""}
          {formatTaka(tip.amountPaisa)}
        </div>
        {tip.chaCount && (
          <div className="text-[11px] text-gray mt-0.5">
            {tip.chaCount} cha
          </div>
        )}
      </div>
    </li>
  );
}
