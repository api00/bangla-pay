import type { Milestone } from "@/db/schema";
import { formatBdtDate } from "@/lib/dates";
import { formatTaka } from "@/lib/money";

interface MilestonesCardProps {
  milestones: Milestone[];
}

function describe(m: Milestone): string {
  if (m.kind === "supporter_count") {
    if (m.threshold === 1) return "First supporter";
    return `${m.threshold.toLocaleString("en-BD")} supporters`;
  }
  if (m.kind === "total_raised") {
    return `${formatTaka(m.threshold)} raised`;
  }
  return m.title;
}

export default function MilestonesCard({ milestones }: MilestonesCardProps) {
  const reached = milestones.filter((m) => m.reachedAt);
  const upcoming = milestones
    .filter((m) => !m.reachedAt)
    .sort((a, b) => a.threshold - b.threshold)
    .slice(0, 2);

  return (
    <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7 shadow-[0_1px_0_0_rgba(14,15,12,0.03)]">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-[17px] font-bold tracking-tight text-[#0e0f0c]">
          Milestones
        </h2>
        <span className="text-[12px] font-semibold text-[#868685] tabular-nums">
          {reached.length} reached
        </span>
      </div>

      {reached.length === 0 && upcoming.length === 0 ? (
        <p className="text-[13px] text-[#868685] leading-[1.55]">
          Milestones unlock as your community grows. Your first supporter is
          one tip away.
        </p>
      ) : (
        <div className="space-y-3">
          {reached.slice(0, 4).map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-2xl bg-[#fde2df] border border-[rgba(218,41,28,0.12)] px-4 py-3"
            >
              <span
                className="w-8 h-8 rounded-full bg-[#da291c] text-white inline-flex items-center justify-center text-[14px] font-bold shrink-0"
                aria-hidden
              >
                ★
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-[#0e0f0c] truncate">
                  {describe(m)}
                </div>
                {m.reachedAt && (
                  <div className="text-[11px] text-[#a3221a] tabular-nums">
                    Reached {formatBdtDate(m.reachedAt)}
                  </div>
                )}
              </div>
            </div>
          ))}
          {upcoming.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-2xl border border-dashed border-[rgba(14,15,12,0.12)] px-4 py-3"
            >
              <span
                className="w-8 h-8 rounded-full bg-[#f2f6ec] text-[#868685] inline-flex items-center justify-center text-[14px] font-bold shrink-0"
                aria-hidden
              >
                ☆
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-[#454745] truncate">
                  {describe(m)}
                </div>
                <div className="text-[11px] text-[#868685]">Upcoming</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
