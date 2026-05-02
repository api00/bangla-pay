"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

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
  }, [error]);

  return (
    <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] p-8 md:p-10 shadow-[0_1px_0_0_rgba(14,15,12,0.03)] text-center max-w-[560px] mx-auto">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#a3221a]">
        Dashboard error
      </p>
      <h2
        className="display mt-3 text-[26px] md:text-[32px] text-[#0e0f0c]"
        style={{ lineHeight: 1.1, fontWeight: 700 }}
      >
        That section couldn&rsquo;t load.
      </h2>
      <p className="mt-3 text-[14px] text-[#454745] leading-[1.55]">
        Try again. Your data is safe — this only affects the page you were
        viewing.
      </p>
      {error.digest && (
        <p className="mt-3 text-[11px] text-[#868685] tabular-nums">
          Reference · {error.digest}
        </p>
      )}
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="h-11 px-5 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[14px] inline-flex items-center justify-center hover:bg-[#cdffad] transition-colors shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
