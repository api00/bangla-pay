"use client";

import { useTransition } from "react";

import {
  removePayoutMethod,
  setDefaultPayoutMethod,
} from "@/app/dashboard/settings/payouts/_actions";
import Card from "@/components/dashboard/settings/Card";
import type { PayoutMethod } from "@/db/schema";
import { formatBdtDate } from "@/lib/dates";

interface MethodsListProps {
  methods: PayoutMethod[];
}

const METHOD_BADGE: Record<
  PayoutMethod["method"],
  { label: string; bg: string; fg: string }
> = {
  bkash: { label: "bKash", bg: "bg-[#fde2df]", fg: "text-[#a3221a]" },
  nagad: { label: "Nagad", bg: "bg-[#fff4d9]", fg: "text-[#7a5b00]" },
  rocket: { label: "Rocket", bg: "bg-[#e8e1ff]", fg: "text-[#3f2b8c]" },
  beftn: { label: "Bank · BEFTN", bg: "bg-[#e2f6d5]", fg: "text-[#163300]" },
  rtgs: { label: "Bank · RTGS", bg: "bg-[#e2f6d5]", fg: "text-[#163300]" },
};

export default function MethodsList({ methods }: MethodsListProps) {
  const [isPending, startTransition] = useTransition();

  if (methods.length === 0) {
    return null;
  }

  return (
    <Card
      title="Your payout methods"
      description="The default method is used for new payout requests."
    >
      <ul className="divide-y divide-[rgba(14,15,12,0.05)]">
        {methods.map((m) => {
          const badge = METHOD_BADGE[m.method];
          return (
            <li
              key={m.id}
              className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 flex-wrap"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded-full ${badge.bg} ${badge.fg}`}
                  >
                    {badge.label}
                  </span>
                  {m.isDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded-full bg-[#0e0f0c] text-white">
                      Default
                    </span>
                  )}
                  {m.isVerified && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded-full bg-[#e2f6d5] text-[#163300]">
                      Verified
                    </span>
                  )}
                </div>
                <div className="text-[14px] font-semibold text-[#0e0f0c] mt-1.5 truncate">
                  {m.accountLabel}
                </div>
                <div className="text-[12px] text-[#868685] mt-0.5">
                  Added {formatBdtDate(m.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!m.isDefault && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        await setDefaultPayoutMethod(m.id);
                      })
                    }
                    className="text-[13px] font-semibold text-[#454745] hover:text-[#0e0f0c] h-9 px-3 rounded-full hover:bg-[#f7f9f5] transition-colors disabled:opacity-50"
                  >
                    Make default
                  </button>
                )}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Remove this payout method? You'll need to add it again to use it.",
                      )
                    ) {
                      startTransition(async () => {
                        const res = await removePayoutMethod(m.id);
                        if (!res.ok && res.error) {
                          window.alert(res.error);
                        }
                      });
                    }
                  }}
                  className="text-[13px] font-semibold text-[#454745] hover:text-[#a3221a] h-9 px-3 rounded-full hover:bg-[#fde2df] transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
