import { formatTaka } from "@/lib/money";

interface StatsGridProps {
  supporterCount: number;
  pendingTipCount: number;
  averageTipPaisa: number;
  paidOrderCount: number;
  shopRevenuePaisa: number;
}

interface Stat {
  label: string;
  value: string;
  sub?: string;
}

export default function StatsGrid({
  supporterCount,
  pendingTipCount,
  averageTipPaisa,
  paidOrderCount,
  shopRevenuePaisa,
}: StatsGridProps) {
  const stats: Stat[] = [
    {
      label: "Supporters",
      value: String(supporterCount),
      sub:
        supporterCount > 0 ? "Distinct supporters" : "Share your page to begin",
    },
    {
      label: "Pending tips",
      value: String(pendingTipCount),
      sub: pendingTipCount > 0 ? "Awaiting payment" : "All caught up",
    },
    {
      label: "Avg. tip",
      value: averageTipPaisa > 0 ? formatTaka(averageTipPaisa) : "—",
      sub: averageTipPaisa > 0 ? "Across all paid tips" : "No tips yet",
    },
    {
      label: "Shop sales",
      value:
        paidOrderCount > 0 ? formatTaka(shopRevenuePaisa) : String(paidOrderCount || "—"),
      sub:
        paidOrderCount > 0
          ? `${paidOrderCount} paid order${paidOrderCount > 1 ? "s" : ""}`
          : "Add a product to start",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl bg-white border border-[rgba(14,15,12,0.06)] p-5 shadow-[0_1px_0_0_rgba(14,15,12,0.03)]"
        >
          <div className="text-[12px] font-semibold text-gray uppercase tracking-[0.14em]">
            {s.label}
          </div>
          <div
            className="display mt-2 text-[26px] md:text-[30px] tabular-nums text-near-black"
            style={{ lineHeight: 1, fontWeight: 700 }}
          >
            {s.value}
          </div>
          {s.sub && (
            <div className="mt-2 text-[12px] text-warm-dark">{s.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
