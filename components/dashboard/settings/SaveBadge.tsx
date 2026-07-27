"use client";

import { useEffect, useRef } from "react";

import { useToast } from "@/components/ui/Toast";

interface SaveBadgeProps {
  savedAt?: number;
  error?: string;
}

/**
 * Inline save feedback, plus a toast when something fails.
 *
 * The badge sits beside the submit button and is enough to confirm a success.
 * Failures are different: the form is often scrolled out of view by the time
 * the server answers, and a line of small red text beside a button nobody is
 * looking at reads as "nothing happened". Errors therefore also raise a toast,
 * which cannot be missed.
 *
 * Every form already rendering this component gets both behaviours.
 */
export default function SaveBadge({ savedAt, error }: SaveBadgeProps) {
  const toast = useToast();
  const lastReported = useRef<string | null>(null);

  useEffect(() => {
    if (!error) {
      lastReported.current = null;
      return;
    }
    // Re-submitting and failing the same way again should surface again, but a
    // plain re-render with unchanged props must not stack duplicate toasts.
    const signature = `${error}|${savedAt ?? ""}`;
    if (lastReported.current === signature) return;
    lastReported.current = signature;
    toast.error(error);
  }, [error, savedAt, toast]);

  if (error) {
    return (
      <span className="text-[12px] font-semibold text-heritage-red-ink">{error}</span>
    );
  }
  if (!savedAt) return null;

  return (
    <span
      key={savedAt}
      className="save-badge inline-flex items-center gap-1.5 text-[12px] font-semibold text-dark-green"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-wise-green" aria-hidden />
      Saved
    </span>
  );
}
