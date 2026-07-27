import Link from "next/link";

import type { DirectoryCreator } from "@/db/queries/creators";

const CATEGORY_LABELS: Record<DirectoryCreator["category"], string> = {
  writer: "Writer",
  illustrator: "Illustrator",
  musician: "Musician",
  educator: "Educator",
  developer: "Developer",
  podcaster: "Podcaster",
  video_creator: "Video creator",
  photographer: "Photographer",
  other: "Creator",
};

interface CreatorCardProps {
  creator: DirectoryCreator;
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  const initial = creator.displayName.trim()[0]?.toUpperCase() ?? "•";

  return (
    <Link
      href={`/${creator.handle}`}
      className="group flex flex-col overflow-hidden rounded-[24px] border border-[rgba(14,15,12,0.08)] bg-white transition-all hover:-translate-y-0.5 hover:border-[rgba(14,15,12,0.2)] hover:shadow-[0_20px_44px_-28px_rgba(14,15,12,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300] motion-reduce:hover:translate-y-0"
    >
      {/* Themed band — each creator's own accent, so the grid isn't uniform. */}
      <div
        aria-hidden
        className="h-16 w-full"
        style={{
          background: `linear-gradient(120deg, ${creator.themeColor}, #e2f6d5)`,
        }}
      />

      <div className="-mt-8 flex flex-1 flex-col px-5 pb-5">
        {creator.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creator.avatarUrl}
            alt=""
            className="h-16 w-16 rounded-full border-[3px] border-white bg-[#e8ebe6] object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white bg-[#163300]"
          >
            <span className="text-[22px] font-bold text-[#9fe870]">
              {initial}
            </span>
          </div>
        )}

        <h3 className="mt-3 text-[16px] font-semibold leading-[1.3] text-[#0e0f0c]">
          {creator.displayName}
        </h3>
        <p className="mt-0.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#868685]">
          {CATEGORY_LABELS[creator.category]}
        </p>

        {creator.bio && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-[1.55] text-[#454745]">
            {creator.bio}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-4 text-[12px] text-[#868685]">
          <span className="tabular-nums">
            {creator.liveProducts > 0
              ? `${creator.liveProducts} ${creator.liveProducts === 1 ? "product" : "products"}`
              : "Tips only"}
          </span>
          {creator.supporters > 0 && (
            <>
              <span aria-hidden className="h-0.5 w-0.5 rounded-full bg-[#c8c8c7]" />
              <span className="tabular-nums">
                {creator.supporters}{" "}
                {creator.supporters === 1 ? "supporter" : "supporters"}
              </span>
            </>
          )}
          <span className="ml-auto font-semibold text-[#163300] transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none">
            Buy a cha →
          </span>
        </div>
      </div>
    </Link>
  );
}
