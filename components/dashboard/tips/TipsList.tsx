import type { Tip } from "@/db/schema";

import TipRow from "./TipRow";

interface TipsListProps {
  title: string;
  tips: Tip[];
  emptyState?: string;
}

export default function TipsList({ title, tips, emptyState }: TipsListProps) {
  return (
    <section className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7 shadow-[0_1px_0_0_rgba(14,15,12,0.03)]">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-[16px] font-semibold tracking-tight text-near-black">
          {title}
        </h2>
        <span className="text-[12px] font-semibold text-gray tabular-nums">
          {tips.length}
        </span>
      </div>
      {tips.length === 0 ? (
        <p className="text-[13px] text-gray leading-[1.55]">
          {emptyState ?? "Nothing here yet."}
        </p>
      ) : (
        <ul>
          {tips.map((tip) => (
            <TipRow key={tip.id} tip={tip} />
          ))}
        </ul>
      )}
    </section>
  );
}
