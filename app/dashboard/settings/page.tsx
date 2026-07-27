import Link from "next/link";

import PageHeader from "@/components/dashboard/PageHeader";
import {
  PageIcon,
  UserIcon,
  WalletIcon,
} from "@/components/dashboard/icons";

export const metadata = { title: "Settings · BanglaPay" };

const sections = [
  {
    title: "Profile & page",
    body: "Display name, bio, theme, social links, tip presets.",
    href: "/dashboard/settings/profile",
    icon: <UserIcon width={22} height={22} />,
  },
  {
    title: "Payouts",
    body: "Add a bKash, Nagad, Rocket, or bank account. Request withdrawals.",
    href: "/dashboard/settings/payouts",
    icon: <WalletIcon width={22} height={22} />,
  },
  {
    title: "Public page",
    body: "Preview your live page. Share the link with supporters.",
    href: "/dashboard/settings/page",
    icon: <PageIcon width={22} height={22} />,
  },
];

export default function SettingsIndexPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Customize your page and account."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] p-5 md:p-6 hover:border-near-black transition-colors block"
          >
            <div className="w-11 h-11 rounded-2xl bg-mint-surface text-dark-green inline-flex items-center justify-center mb-4">
              {s.icon}
            </div>
            <div className="flex items-center gap-2 text-[15px] font-semibold text-near-black">
              {s.title}
              <span
                className="text-warm-dark group-hover:translate-x-0.5 transition-transform"
                aria-hidden
              >
                →
              </span>
            </div>
            <p className="mt-1 text-[13px] text-gray leading-[1.55]">
              {s.body}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
