"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";

import {
  looksLikeDeploymentSkew,
  tryAutoRecover,
} from "@/lib/error-recovery";
import { SUPPORT_EMAIL } from "@/lib/site";

interface ErrorPageProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function RootError({ error, unstable_retry }: ErrorPageProps) {

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[root error boundary]", error);
    }
    // Any first error triggers a silent reload (30s cooldown). Once this
    // returns true the browser is already navigating away, so there is
    // nothing left for this tree to decide.
    tryAutoRecover();
    void looksLikeDeploymentSkew;
  }, [error]);


  return (
    <main className="min-h-screen bg-off-white flex items-center justify-center px-6">
      <div className="max-w-[480px] w-full text-center space-y-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gray">
          Something broke
        </p>
        <h1
          className="display text-[32px] sm:text-[40px] text-near-black"
          style={{ lineHeight: 1.05, fontWeight: 700 }}
        >
          We hit an unexpected snag.
        </h1>
        <p className="text-[15px] text-warm-dark leading-[1.55]">
          Try again — most issues clear up on a retry. If it keeps happening,
          email{" "}
          <a
            className="font-semibold text-near-black underline underline-offset-4 decoration-wise-green decoration-[2px]"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          and we&rsquo;ll dig in.
        </p>
        {error.digest && (
          <p className="text-[11px] text-gray tabular-nums">
            Reference · {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="h-12 px-6 rounded-full bg-wise-green text-dark-green font-semibold text-[15px] inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="h-12 px-6 rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-near-black font-semibold text-[15px] inline-flex items-center justify-center gap-2 hover:border-near-black transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
