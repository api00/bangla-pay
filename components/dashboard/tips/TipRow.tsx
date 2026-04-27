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
    className: "bg-[#e2f6d5] text-[#163300]",
  },
  pending: {
    label: "Pending",
    className: "bg-[#fff4d9] text-[#7a5b00]",
  },
  failed: {
    label: "Failed",
    className: "bg-[#fde2df] text-[#a3221a]",
  },
  refunded: {
    label: "Refunded",
    className: "bg-[#e8ebe6] text-[#454745]",
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
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#cdffad] to-[#e2f6d5] flex items-center justify-center shrink-0">
        <span className="text-[13px] font-semibold text-[#163300]">
          {initialOf(tip.supporterName)}
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-semibold text-[#0e0f0c] truncate">
            {supporter}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-full ${status.className}`}
          >
            {status.label}
          </span>
        </div>
        {tip.message && (
          <p className="text-[13px] text-[#454745] mt-1 leading-[1.55] line-clamp-2">
            {tip.message}
          </p>
        )}
        <p className="text-[11px] text-[#868685] mt-1 tabular-nums">
          {DATE_FORMATTER.format(tip.createdAt)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[15px] font-semibold tabular-nums text-[#0e0f0c]">
          {tip.status === "succeeded" ? "+" : ""}
          {formatTaka(tip.amountPaisa)}
        </div>
        {tip.chaCount && (
          <div className="text-[11px] text-[#868685] mt-0.5">
            {tip.chaCount} cha
          </div>
        )}
      </div>
    </li>
  );
}
