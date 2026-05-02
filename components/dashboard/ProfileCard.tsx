import Link from "next/link";

import { creatorDisplayUrl } from "@/lib/site";

import { ShareIcon } from "./icons";

interface ProfileCardProps {
  displayName: string;
  handle: string;
  initials: string;
}

export default function ProfileCard({
  displayName,
  handle,
  initials,
}: ProfileCardProps) {
  const firstName = displayName.split(/\s+/)[0] ?? displayName;
  return (
    <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7 shadow-[0_1px_0_0_rgba(14,15,12,0.03)]">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-full bg-gradient-to-br from-[#9fe870] to-[#cdffad] flex items-center justify-center shrink-0">
            <span className="text-[24px] md:text-[28px] font-semibold text-[#163300] uppercase tabular-nums">
              {initials}
            </span>
            <span
              className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#9fe870] ring-2 ring-white flex items-center justify-center"
              aria-label="Page is live"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#163300]" />
            </span>
          </div>

          <div className="min-w-0">
            <h1
              className="display text-[24px] md:text-[30px] tracking-tight"
              style={{ lineHeight: 1.05, fontWeight: 700 }}
            >
              Hi, {firstName}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-[13px] md:text-[14px] text-[#454745]">
              <span className="tabular-nums">{creatorDisplayUrl(handle)}</span>
            </div>
          </div>
        </div>

        <Link
          href={`/${handle}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#0e0f0c] text-white text-[14px] font-semibold px-5 h-11 hover:bg-[#163300] transition-colors"
        >
          <ShareIcon width={15} height={15} />
          View page
        </Link>
      </div>
    </div>
  );
}
