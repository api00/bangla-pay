"use client";

import { useTransition } from "react";
import Link from "next/link";

import { markOrderFailed, markOrderPaid } from "./_actions";

interface Props {
  orderId: string;
  cancelHref: string;
}

export default function StubOrderButtons({ orderId, cancelHref }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() =>
          startTransition(async () => {
            await markOrderPaid({ orderId });
          })
        }
        disabled={isPending}
        className="w-full h-12 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[15px] inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_1px_0_0_rgba(22,51,0,0.18),0_10px_30px_-14px_rgba(159,232,112,0.7)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isPending ? "Confirming…" : "Simulate paid"}
        {!isPending && <span aria-hidden>→</span>}
      </button>
      <button
        type="button"
        onClick={() =>
          startTransition(async () => {
            await markOrderFailed({ orderId });
          })
        }
        disabled={isPending}
        className="w-full h-12 rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[#454745] font-semibold text-[15px] inline-flex items-center justify-center gap-2 hover:border-[#0e0f0c] hover:text-[#0e0f0c] transition-colors disabled:opacity-60"
      >
        Simulate failure
      </button>
      <Link
        href={cancelHref}
        className="block text-center text-[13px] font-semibold text-[#454745] underline underline-offset-4 decoration-[rgba(14,15,12,0.14)] hover:text-[#0e0f0c] decoration-[2px] py-2"
      >
        Cancel
      </Link>
    </div>
  );
}
