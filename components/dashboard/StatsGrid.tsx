type Stat = {
  label: string;
  value: string;
  trend?: string;
  sub?: string;
};

const stats: Stat[] = [
  { label: "Supporters", value: "142", trend: "+12 this week" },
  { label: "Page views", value: "1,284", trend: "+8% vs last week" },
  { label: "Shop sales", value: "38", sub: "3 pending delivery" },
  { label: "Avg. tip", value: "৳172", sub: "Up from ৳150" },
];

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl bg-white border border-[rgba(14,15,12,0.06)] p-5 shadow-[0_1px_0_0_rgba(14,15,12,0.03)]"
        >
          <div className="text-[12px] font-semibold text-[#868685] uppercase tracking-[0.14em]">
            {s.label}
          </div>
          <div
            className="display mt-2 text-[26px] md:text-[30px] tabular-nums text-[#0e0f0c]"
            style={{ lineHeight: 1, fontWeight: 700 }}
          >
            {s.value}
          </div>
          {(s.trend || s.sub) && (
            <div className="mt-2 text-[12px] text-[#454745]">
              {s.trend ?? s.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
