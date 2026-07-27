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
  bkash: { label: "bKash", bg: "bg-danger-surface", fg: "text-heritage-red-ink" },
  nagad: { label: "Nagad", bg: "bg-warning-surface", fg: "text-warning-ink" },
  rocket: { label: "Rocket", bg: "bg-[#e8e1ff]", fg: "text-[#3f2b8c]" },
  beftn: { label: "Bank · BEFTN", bg: "bg-light-mint", fg: "text-dark-green" },
  rtgs: { label: "Bank · RTGS", bg: "bg-light-mint", fg: "text-dark-green" },
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
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded-full bg-dark-green text-white">
                      Default
                    </span>
                  )}
                  {m.isVerified && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded-full bg-light-mint text-dark-green">
                      Verified
                    </span>
                  )}
                </div>
                <div className="text-[14px] font-semibold text-near-black mt-1.5 truncate">
                  {m.accountLabel}
                </div>
                <div className="text-[12px] text-gray mt-0.5">
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
                    className="text-[13px] font-semibold text-warm-dark hover:text-near-black h-9 px-3 rounded-full hover:bg-off-white transition-colors disabled:opacity-50"
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
                  className="text-[13px] font-semibold text-warm-dark hover:text-heritage-red-ink h-9 px-3 rounded-full hover:bg-danger-surface transition-colors disabled:opacity-50"
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
