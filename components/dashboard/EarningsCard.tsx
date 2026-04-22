import { ChevronDownIcon } from "./icons";

const breakdown = [
  { label: "Tips", amount: "৳12,000", color: "#9fe870" },
  { label: "Shop", amount: "৳10,400", color: "#163300" },
  { label: "Memberships", amount: "৳2,000", color: "#cdffad" },
];

const spark = [20, 28, 22, 40, 34, 52, 48, 64, 58, 72, 66, 88];

export default function EarningsCard() {
  const max = Math.max(...spark);
  return (
    <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7 shadow-[0_1px_0_0_rgba(14,15,12,0.03)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[17px] font-bold tracking-tight text-[#0e0f0c]">
          Earnings
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[rgba(14,15,12,0.12)] px-3 h-8 text-[12px] font-semibold text-[#0e0f0c] hover:border-[#0e0f0c] transition-colors"
        >
          Last 30 days
          <ChevronDownIcon width={12} height={12} />
        </button>
      </div>

      <div className="mt-6 flex items-end justify-between gap-8">
        <div>
          <div
            className="display text-[44px] md:text-[56px] tabular-nums text-[#0e0f0c]"
            style={{ lineHeight: 1, fontWeight: 700 }}
          >
            ৳24,400
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e2f6d5] text-[#163300] px-2.5 py-1 text-[11px] font-semibold tabular-nums">
            <span aria-hidden>↑</span>
            18% vs last period
          </div>
        </div>

        {/* Sparkline */}
        <div className="hidden sm:flex items-end gap-1.5 h-20" aria-hidden>
          {spark.map((v, i) => (
            <span
              key={i}
              className="w-1.5 rounded-full bg-[#9fe870]"
              style={{
                height: `${(v / max) * 100}%`,
                opacity: 0.45 + (i / spark.length) * 0.55,
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-7 pt-5 border-t border-[rgba(14,15,12,0.06)] grid grid-cols-3 gap-4">
        {breakdown.map((b) => (
          <div key={b.label} className="flex items-start gap-2">
            <span
              className="mt-1 w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: b.color }}
              aria-hidden
            />
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-[#868685]">
                {b.label}
              </div>
              <div className="text-[15px] md:text-[16px] font-bold tabular-nums text-[#0e0f0c] mt-0.5">
                {b.amount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
