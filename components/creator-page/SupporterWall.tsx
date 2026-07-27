import type { PublicProfileSupporter } from "@/db/queries/profile";
import { formatTaka } from "@/lib/money";

interface SupporterWallProps {
  supporters: PublicProfileSupporter[];
  bnNumerals: boolean;
}

const RELATIVE_TIME = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600)
    return RELATIVE_TIME.format(-Math.floor(diff / 60), "minute");
  if (diff < 86_400)
    return RELATIVE_TIME.format(-Math.floor(diff / 3_600), "hour");
  if (diff < 7 * 86_400)
    return RELATIVE_TIME.format(-Math.floor(diff / 86_400), "day");
  if (diff < 30 * 86_400)
    return RELATIVE_TIME.format(-Math.floor(diff / (7 * 86_400)), "week");
  return RELATIVE_TIME.format(-Math.floor(diff / (30 * 86_400)), "month");
}

export default function SupporterWall({
  supporters,
  bnNumerals,
}: SupporterWallProps) {
  if (supporters.length === 0) {
    return (
      <section aria-labelledby="supporter-wall" className="space-y-4">
        <h2
          id="supporter-wall"
          className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gray"
        >
          Recent supporters
        </h2>
        <p className="text-[14px] text-gray leading-[1.55]">
          No public messages yet. Be the first to leave one.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="supporter-wall" className="space-y-4">
      <h2
        id="supporter-wall"
        className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gray"
      >
        Recent supporters
      </h2>
      <ul className="space-y-3">
        {supporters.map((supporter) => (
          <li
            key={supporter.id}
            className="rounded-2xl border border-[rgba(14,15,12,0.06)] bg-white px-5 py-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[14px] font-semibold text-near-black">
                {supporter.supporterName ?? "Anonymous"}
              </p>
              <p className="text-[12px] text-gray tabular-nums shrink-0">
                {formatTaka(supporter.amountPaisa, {
                  bengaliNumerals: bnNumerals,
                })}{" "}
                ·{" "}
                {timeAgo(
                  supporter.createdAt instanceof Date
                    ? supporter.createdAt
                    : new Date(supporter.createdAt),
                )}
              </p>
            </div>
            <p className="mt-2 text-[14px] text-warm-dark leading-[1.55] whitespace-pre-line">
              {supporter.message}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
