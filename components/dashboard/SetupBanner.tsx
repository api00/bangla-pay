import Link from "next/link";

import { AlertIcon } from "./icons";

interface SetupBannerProps {
  hasPayoutMethod: boolean;
  availablePaisa: number;
}

export default function SetupBanner({
  hasPayoutMethod,
  availablePaisa,
}: SetupBannerProps) {
  // Hide once a payout method exists, regardless of balance.
  if (hasPayoutMethod) return null;

  const hasBalance = availablePaisa > 0;
  const description = hasBalance
    ? "Your earnings are building up. Link bKash, Nagad, or a bank account to withdraw."
    : "Add bKash, Nagad, Rocket, or a bank account so you can withdraw the moment your first tip lands.";

  return (
    <div className="rounded-2xl bg-[#fff7e0] border border-[#f5d989] px-5 py-4 flex items-center gap-4 flex-wrap">
      <span className="w-9 h-9 rounded-full bg-[#f5d989] text-[#6b4900] inline-flex items-center justify-center shrink-0">
        <AlertIcon width={18} height={18} />
      </span>
      <div className="flex-1 min-w-[200px]">
        <div className="text-[14px] font-bold text-[#6b4900]">
          Connect a payout method to cash out
        </div>
        <div className="text-[13px] text-[#8a6d00] mt-0.5">{description}</div>
      </div>
      <Link
        href="/dashboard/settings/payouts"
        className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#0e0f0c] text-white text-[13px] font-semibold px-4 h-9 hover:bg-[#163300] transition-colors"
      >
        Connect now
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
