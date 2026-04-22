import Link from "next/link";
import type { ReactNode } from "react";
import {
  HomeIcon,
  PageIcon,
  ExternalIcon,
  HeartIcon,
  ShopIcon,
  LockIcon,
  PeopleIcon,
  MessageIcon,
  UserIcon,
  WalletIcon,
  BoltIcon,
} from "./icons";

type Item = {
  label: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
  active?: boolean;
  badge?: string;
};

const overview: Item[] = [
  { label: "Home", href: "/dashboard", icon: <HomeIcon />, active: true },
  { label: "My page", href: "/tahsina", icon: <PageIcon />, external: true },
  { label: "Supporters", href: "#", icon: <PeopleIcon /> },
  { label: "Messages", href: "#", icon: <MessageIcon />, badge: "3" },
];

const earn: Item[] = [
  { label: "Tips", href: "#", icon: <HeartIcon /> },
  { label: "Shop", href: "#", icon: <ShopIcon /> },
  { label: "Memberships", href: "#", icon: <LockIcon /> },
];

const settings: Item[] = [
  { label: "Profile", href: "#", icon: <UserIcon /> },
  { label: "Payouts", href: "#", icon: <WalletIcon /> },
  { label: "Integrations", href: "#", icon: <BoltIcon /> },
];

function NavLink({ item }: { item: Item }) {
  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
      className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-[14px] font-semibold transition-colors ${
        item.active
          ? "bg-[#f2f6ec] text-[#0e0f0c]"
          : "text-[#454745] hover:bg-[#f7f9f5] hover:text-[#0e0f0c]"
      }`}
    >
      <span
        className={`${
          item.active ? "text-[#163300]" : "text-[#454745]"
        } shrink-0`}
      >
        {item.icon}
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.external && (
        <ExternalIcon className="opacity-40 group-hover:opacity-70 transition-opacity" />
      )}
      {item.badge && (
        <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full bg-[#da291c] text-white">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function Section({
  title,
  items,
}: {
  title?: string;
  items: Item[];
}) {
  return (
    <div>
      {title && (
        <div className="px-3 mb-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-[#868685]">
          {title}
        </div>
      )}
      <nav className="space-y-0.5">
        {items.map((item) => (
          <NavLink key={item.label} item={item} />
        ))}
      </nav>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-[240px] shrink-0 flex-col border-r border-[rgba(14,15,12,0.06)] bg-white">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-1.5 px-6 h-16 shrink-0"
        aria-label="BanglaPay home"
      >
        <span className="display text-xl tracking-tight">banglapay</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#9fe870]" aria-hidden />
      </Link>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <Section items={overview} />
        <Section title="Earn" items={earn} />
        <Section title="Settings" items={settings} />
      </div>

      {/* Footer — user card */}
      <div className="border-t border-[rgba(14,15,12,0.06)] p-3">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[#f7f9f5] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9fe870] to-[#cdffad] flex items-center justify-center shrink-0">
            <span className="bangla-display text-[13px] text-[#163300]">তা</span>
          </div>
          <div className="min-w-0 text-left flex-1">
            <div className="text-[13px] font-semibold text-[#0e0f0c] truncate">
              Tahsina R.
            </div>
            <div className="text-[11px] text-[#868685] truncate">
              tahsina@banglapay.com
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}
