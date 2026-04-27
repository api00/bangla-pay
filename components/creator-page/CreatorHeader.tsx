import type { Creator, CreatorPage } from "@/db/schema";

interface CreatorHeaderProps {
  creator: Creator;
  page: CreatorPage;
}

const CATEGORY_LABEL: Record<string, string> = {
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

function avatarInitials(displayName: string): string {
  return (
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export default function CreatorHeader({ creator, page }: CreatorHeaderProps) {
  const initials = avatarInitials(creator.displayName);
  const categoryLabel =
    CATEGORY_LABEL[creator.category] ?? CATEGORY_LABEL.other;

  return (
    <header className="flex flex-col items-center text-center gap-5">
      <div
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full inline-flex items-center justify-center shrink-0 ring-4 ring-white shadow-[0_10px_40px_-12px_rgba(14,15,12,0.18)]"
        style={{
          background:
            "linear-gradient(135deg, var(--avatar-from), var(--avatar-to))",
          ["--avatar-from" as string]: page.themeColor,
          ["--avatar-to" as string]: "#cdffad",
        }}
      >
        {page.avatarUrl ? (
          <img
            src={page.avatarUrl}
            alt={`${creator.displayName} avatar`}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-[24px] sm:text-[28px] font-semibold text-[#163300] tabular-nums">
            {initials}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <h1
          className="display text-[28px] sm:text-[36px] md:text-[44px] text-[#0e0f0c]"
          style={{ lineHeight: 1.1, fontWeight: 700 }}
        >
          {creator.displayName}
        </h1>
        <div className="flex items-center gap-3 text-[13px] text-[#454745]">
          <span className="font-semibold text-[#163300]">
            @{creator.handle}
          </span>
          <span aria-hidden className="w-1 h-1 rounded-full bg-[#c8c8c7]" />
          <span>{categoryLabel}</span>
          {creator.isVerified && (
            <>
              <span
                aria-hidden
                className="w-1 h-1 rounded-full bg-[#c8c8c7]"
              />
              <span className="inline-flex items-center gap-1 text-[#163300] font-semibold">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Verified
              </span>
            </>
          )}
        </div>
      </div>

      {page.bio && (
        <p className="max-w-[520px] text-[16px] text-[#454745] leading-[1.55]">
          {page.bio}
        </p>
      )}
    </header>
  );
}
