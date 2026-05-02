import Link from "next/link";

import { BellIcon, ShareIcon } from "./icons";

interface TopBarProps {
  handle: string;
  unreadMessages: number;
}

export default function TopBar({ handle, unreadMessages }: TopBarProps) {
  const url = `banglapay.com/${handle}`;
  return (
    <header className="sticky top-0 z-30 bg-[#f7f9f5]/85 backdrop-blur-md border-b border-[rgba(14,15,12,0.06)]">
      <div className="flex items-center justify-between h-16 px-6 md:px-8 gap-4">
        {/* Left — live pill */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[rgba(14,15,12,0.08)] px-3 py-1.5 min-w-0">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#9fe870] animate-pulse shrink-0"
            aria-hidden
          />
          <span className="text-[12px] font-semibold text-[#454745] truncate">
            Your page is live at{" "}
            <Link
              href={`/${handle}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#0e0f0c] underline underline-offset-2 decoration-[#9fe870] decoration-2 hover:decoration-[#cdffad]"
            >
              {url}
            </Link>
          </span>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/dashboard/settings/page"
            className="inline-flex items-center gap-2 h-9 px-3 rounded-full bg-white border border-[rgba(14,15,12,0.08)] text-[13px] font-semibold text-[#0e0f0c] hover:border-[#0e0f0c] transition-colors"
          >
            <ShareIcon width={14} height={14} />
            Share
          </Link>
          <Link
            href="/dashboard/messages"
            aria-label={
              unreadMessages > 0
                ? `${unreadMessages} unread messages`
                : "Notifications"
            }
            className="relative w-9 h-9 rounded-full bg-white border border-[rgba(14,15,12,0.08)] inline-flex items-center justify-center text-[#0e0f0c] hover:border-[#0e0f0c] transition-colors"
          >
            <BellIcon width={16} height={16} />
            {unreadMessages > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#da291c] ring-2 ring-white"
                aria-hidden
              />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
