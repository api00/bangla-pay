"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  HomeIcon,
  PageIcon,
  ExternalIcon,
  HeartIcon,
  ShopIcon,
  PeopleIcon,
  MessageIcon,
  UserIcon,
  WalletIcon,
} from "./icons";

interface Item {
  label: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
  badge?: string;
}

export interface SidebarUser {
  email: string;
  displayName: string;
  initials: string;
  handle: string;
}

interface SidebarProps {
  user: SidebarUser;
  unreadMessages: number;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  active,
}: {
  item: Item;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
      className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-[14px] font-semibold transition-colors ${
        active
          ? "bg-[#f2f6ec] text-[#0e0f0c]"
          : "text-[#454745] hover:bg-[#f7f9f5] hover:text-[#0e0f0c]"
      }`}
    >
      <span
        className={`${active ? "text-[#163300]" : "text-[#454745]"} shrink-0`}
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
  pathname,
}: {
  title?: string;
  items: Item[];
  pathname: string;
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
          <NavLink
            key={item.label}
            item={item}
            active={item.external ? false : isActive(pathname, item.href)}
          />
        ))}
      </nav>
    </div>
  );
}

export default function Sidebar({ user, unreadMessages }: SidebarProps) {
  const pathname = usePathname() ?? "/dashboard";

  const overview: Item[] = [
    { label: "Home", href: "/dashboard", icon: <HomeIcon /> },
    {
      label: "My page",
      href: `/${user.handle}`,
      icon: <PageIcon />,
      external: true,
    },
    {
      label: "Supporters",
      href: "/dashboard/supporters",
      icon: <PeopleIcon />,
    },
    {
      label: "Messages",
      href: "/dashboard/messages",
      icon: <MessageIcon />,
      badge: unreadMessages > 0 ? String(unreadMessages) : undefined,
    },
  ];

  const earn: Item[] = [
    { label: "Tips", href: "/dashboard/tips", icon: <HeartIcon /> },
    { label: "Shop", href: "/dashboard/shop", icon: <ShopIcon /> },
    { label: "Orders", href: "/dashboard/orders", icon: <ShopIcon /> },
  ];

  const settings: Item[] = [
    {
      label: "Profile",
      href: "/dashboard/settings/profile",
      icon: <UserIcon />,
    },
    {
      label: "Payouts",
      href: "/dashboard/settings/payouts",
      icon: <WalletIcon />,
    },
  ];

  return (
    <aside className="hidden lg:flex w-[240px] shrink-0 flex-col border-r border-[rgba(14,15,12,0.06)] bg-white sticky top-0 h-screen self-start">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 px-6 h-16 shrink-0"
        aria-label="BanglaPay home"
      >
        <span className="display text-xl tracking-tight">banglapay</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#9fe870]" aria-hidden />
      </Link>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <Section items={overview} pathname={pathname} />
        <Section title="Earn" items={earn} pathname={pathname} />
        <Section title="Settings" items={settings} pathname={pathname} />
      </div>

      {/* Footer — user card + sign out */}
      <div className="border-t border-[rgba(14,15,12,0.06)] p-3 space-y-1">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9fe870] to-[#cdffad] flex items-center justify-center shrink-0">
            <span className="text-[12px] font-semibold text-[#163300] uppercase tabular-nums">
              {user.initials}
            </span>
          </div>
          <div className="min-w-0 text-left flex-1">
            <div className="text-[13px] font-semibold text-[#0e0f0c] truncate">
              {user.displayName}
            </div>
            <div className="text-[11px] text-[#868685] truncate">
              {user.email}
            </div>
          </div>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full px-2 py-2 rounded-xl text-[13px] font-semibold text-[#454745] hover:bg-[#f7f9f5] hover:text-[#da291c] transition-colors text-left"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
