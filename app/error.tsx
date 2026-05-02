"use client"; // Error boundaries must be Client Components

import { useEffect, useState } from "react";
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
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[root error boundary]", error);
    }
    // Aggressive: any first error triggers a silent reload (30s cooldown).
    const triggered = tryAutoRecover();
    if (triggered) setRecovering(true);
    void looksLikeDeploymentSkew;
  }, [error]);

  if (recovering) return null;

  return (
    <main className="min-h-screen bg-[#f7f9f5] flex items-center justify-center px-6">
      <div className="max-w-[480px] w-full text-center space-y-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#868685]">
          Something broke
        </p>
        <h1
          className="display text-[32px] sm:text-[40px] text-[#0e0f0c]"
          style={{ lineHeight: 1.05, fontWeight: 700 }}
        >
          We hit an unexpected snag.
        </h1>
        <p className="text-[15px] text-[#454745] leading-[1.55]">
          Try again — most issues clear up on a retry. If it keeps happening,
          email{" "}
          <a
            className="font-semibold text-[#0e0f0c] underline underline-offset-4 decoration-[#9fe870] decoration-[2px]"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          and we&rsquo;ll dig in.
        </p>
        {error.digest && (
          <p className="text-[11px] text-[#868685] tabular-nums">
            Reference · {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="h-12 px-6 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[15px] inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="h-12 px-6 rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[#0e0f0c] font-semibold text-[15px] inline-flex items-center justify-center gap-2 hover:border-[#0e0f0c] transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
