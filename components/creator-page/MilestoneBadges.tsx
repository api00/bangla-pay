import type { Milestone } from "@/db/schema";
import { formatTaka } from "@/lib/money";

interface MilestoneBadgesProps {
  milestones: Milestone[];
  bnNumerals?: boolean;
}

function describe(m: Milestone, bnNumerals: boolean): string {
  if (m.kind === "supporter_count") {
    if (m.threshold === 1) return "First supporter";
    const v = m.threshold.toLocaleString("en-BD");
    return `${v} supporters`;
  }
  if (m.kind === "total_raised") {
    return `${formatTaka(m.threshold, { bengaliNumerals: bnNumerals })} raised`;
  }
  return m.title;
}

export default function MilestoneBadges({
  milestones,
  bnNumerals = false,
}: MilestoneBadgesProps) {
  if (milestones.length === 0) return null;
  return (
    <section aria-label="Milestones" className="space-y-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray">
        Milestones
      </div>
      <ul className="flex flex-wrap gap-2">
        {milestones.map((m) => (
          <li
            key={m.id}
            className="inline-flex items-center gap-2 rounded-full bg-danger-surface border border-[rgba(218,41,28,0.18)] pl-2.5 pr-3.5 py-1.5"
          >
            <span
              className="w-5 h-5 rounded-full bg-heritage-red text-white inline-flex items-center justify-center text-[11px] font-bold"
              aria-hidden
            >
              ★
            </span>
            <span className="text-[12px] font-semibold text-heritage-red-ink tabular-nums">
              {describe(m, bnNumerals)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
