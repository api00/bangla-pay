import { formatTaka, formatTakaCompact } from "@/lib/money";

interface CreatorStatsProps {
  totalRaisedPaisa: number;
  supporterCount: number;
  showTotalRaised: boolean;
  showSupporters: boolean;
  bnNumerals: boolean;
}

export default function CreatorStats({
  totalRaisedPaisa,
  supporterCount,
  showTotalRaised,
  showSupporters,
  bnNumerals,
}: CreatorStatsProps) {
  if (!showTotalRaised && !showSupporters) return null;

  return (
    <dl className="grid grid-cols-2 gap-3 sm:gap-4 max-w-[420px] mx-auto w-full">
      {showTotalRaised && (
        <div className="rounded-2xl border border-[rgba(14,15,12,0.06)] bg-white px-4 py-4 text-center">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray">
            Raised
          </dt>
          <dd className="mt-1 text-[22px] font-semibold text-near-black tabular-nums">
            {totalRaisedPaisa >= 100_00_00
              ? formatTakaCompact(totalRaisedPaisa)
              : formatTaka(totalRaisedPaisa, { bengaliNumerals: bnNumerals })}
          </dd>
        </div>
      )}
      {showSupporters && (
        <div className="rounded-2xl border border-[rgba(14,15,12,0.06)] bg-white px-4 py-4 text-center">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray">
            Supporters
          </dt>
          <dd className="mt-1 text-[22px] font-semibold text-near-black tabular-nums">
            {bnNumerals
              ? supporterCount
                  .toString()
                  .replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)])
              : supporterCount}
          </dd>
        </div>
      )}
    </dl>
  );
}
