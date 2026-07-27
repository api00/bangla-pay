"use client";

import { useTransition } from "react";
import Link from "next/link";

import { markTipFailed, markTipPaid } from "./_actions";

interface StubCheckoutButtonsProps {
  tipId: string;
  handle: string;
}

export default function StubCheckoutButtons({
  tipId,
  handle,
}: StubCheckoutButtonsProps) {
  const [isPending, startTransition] = useTransition();

  function paySimulated() {
    startTransition(async () => {
      await markTipPaid({ tipId });
    });
  }

  function failSimulated() {
    startTransition(async () => {
      await markTipFailed({ tipId });
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={paySimulated}
        disabled={isPending}
        className="w-full h-12 rounded-full bg-wise-green text-dark-green font-semibold text-[15px] inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_1px_0_0_rgba(22,51,0,0.18),0_10px_30px_-14px_rgba(159,232,112,0.7)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isPending ? "Confirming…" : "Simulate paid"}
        {!isPending && <span aria-hidden>→</span>}
      </button>

      <button
        type="button"
        onClick={failSimulated}
        disabled={isPending}
        className="w-full h-12 rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-warm-dark font-semibold text-[15px] inline-flex items-center justify-center gap-2 hover:border-near-black hover:text-near-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Simulate failure
      </button>

      <Link
        href={`/${handle}`}
        className="block text-center text-[13px] font-semibold text-warm-dark underline underline-offset-4 decoration-[rgba(14,15,12,0.14)] hover:text-near-black decoration-[2px] py-2"
      >
        Cancel and go back
      </Link>
    </div>
  );
}
