"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

import { tryAutoRecover } from "@/lib/error-recovery";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function DashboardError({
  error,
  unstable_retry,
}: DashboardErrorProps) {

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[dashboard error]", error);
    }
    // Aggressive policy: any first error in this tab's session triggers a
    // silent reload. tryAutoRecover's 30s sessionStorage cooldown prevents
    // loops if the error is a real bug — the second occurrence shows UI.
    tryAutoRecover();
  }, [error]);


  return (
    <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] p-8 md:p-10 shadow-[0_1px_0_0_rgba(14,15,12,0.03)] text-center max-w-[560px] mx-auto">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-heritage-red-ink">
        Dashboard error
      </p>
      <h2
        className="display mt-3 text-[26px] md:text-[32px] text-near-black"
        style={{ lineHeight: 1.1, fontWeight: 700 }}
      >
        That section couldn&rsquo;t load.
      </h2>
      <p className="mt-3 text-[14px] text-warm-dark leading-[1.55]">
        Try again. Your data is safe — this only affects the page you were
        viewing.
      </p>
      {error.digest && (
        <p className="mt-3 text-[11px] text-gray tabular-nums">
          Reference · {error.digest}
        </p>
      )}
      <div className="mt-5 flex justify-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="h-11 px-5 rounded-full bg-wise-green text-dark-green font-semibold text-[14px] inline-flex items-center justify-center hover:bg-pastel-green transition-colors shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)]"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-11 px-5 rounded-full border border-[rgba(14,15,12,0.12)] bg-white text-near-black font-semibold text-[14px] inline-flex items-center justify-center hover:border-near-black transition-colors"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}
