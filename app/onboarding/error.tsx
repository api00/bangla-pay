"use client";

import { useEffect, useState } from "react";

import {
  looksLikeDeploymentSkew,
  tryAutoRecover,
} from "@/lib/error-recovery";

interface OnboardingErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function OnboardingError({
  error,
  unstable_retry,
}: OnboardingErrorProps) {
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    const triggered = tryAutoRecover();
    if (triggered) setRecovering(true);
    void looksLikeDeploymentSkew;
  }, [error]);

  if (recovering) return null;

  return (
    <main className="min-h-screen bg-[#f7f9f5] flex items-center justify-center px-6">
      <div className="max-w-[480px] w-full text-center space-y-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#a3221a]">
          Onboarding hiccup
        </p>
        <h1
          className="display text-[28px] sm:text-[34px] text-[#0e0f0c]"
          style={{ lineHeight: 1.05, fontWeight: 700 }}
        >
          We couldn&rsquo;t finish that step.
        </h1>
        <p className="text-[14px] text-[#454745] leading-[1.55]">
          Try again — your progress is saved. If it keeps failing, reach out
          and we&rsquo;ll help finish your setup.
        </p>
        {error.digest && (
          <p className="text-[11px] text-[#868685] tabular-nums">
            Reference · {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="h-12 px-6 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[15px] inline-flex items-center justify-center mt-2"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
