"use client";

import { useState, useTransition } from "react";

import { refreshFanInsights } from "@/app/dashboard/_actions/fan-insights";
import { useToast } from "@/components/ui/Toast";
import type { CreatorFanInsight, FanWant } from "@/db/schema";
import { formatBdtDate } from "@/lib/dates";

interface FanInsightsCardProps {
  insight: CreatorFanInsight | null;
  /** Total supporter messages, so the empty state can say something useful. */
  messageCount: number;
  /** New messages have arrived since the stored read. */
  isStale: boolean;
  minMessages: number;
}

const MOOD_LABEL: Record<string, string> = {
  delighted: "Delighted",
  positive: "Positive",
  mixed: "Mixed",
  concerned: "Concerned",
};

/**
 * Score colour tracks the reading, not the brand. Heritage Red is reserved
 * for milestones, so a low score uses the amber warning surface instead.
 */
function scoreTone(score: number): { bar: string; ink: string } {
  if (score >= 70) return { bar: "bg-wise-green", ink: "text-dark-green" };
  if (score >= 45) return { bar: "bg-warning", ink: "text-warning-ink" };
  return { bar: "bg-gray-light", ink: "text-warm-dark" };
}

export default function FanInsightsCard({
  insight,
  messageCount,
  isStale,
  minMessages,
}: FanInsightsCardProps) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [dismissedStale, setDismissedStale] = useState(false);

  function refresh() {
    startTransition(async () => {
      const result = await refreshFanInsights();
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't read your messages.");
        return;
      }
      if (result.skipped === "too_few") {
        toast.info(
          `Need at least ${minMessages} messages before this means anything.`,
        );
        return;
      }
      if (result.skipped === "unusable") {
        toast.info("Couldn't make sense of those messages. Try again later.");
        return;
      }
      if (result.skipped === "disabled") {
        toast.info("Message insights aren't switched on yet.");
        return;
      }
      setDismissedStale(true);
      toast.success("Updated from your latest messages");
    });
  }

  const wants = (insight?.wantsNext ?? []) as FanWant[];
  const tone = scoreTone(insight?.happinessScore ?? 0);
  const canRun = messageCount >= minMessages;

  return (
    <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7 shadow-[0_1px_0_0_rgba(14,15,12,0.03)]">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-[17px] font-bold tracking-tight text-near-black">
          What your fans are saying
        </h2>
        {insight && (
          <span className="text-[12px] font-semibold text-gray tabular-nums">
            {insight.messagesAnalysed} message
            {insight.messagesAnalysed === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {!insight ? (
        <div className="space-y-4">
          <p className="text-[13px] text-gray leading-[1.55]">
            {canRun
              ? "Read your supporter messages for an overall mood and what people are asking you to make next."
              : `Once ${minMessages} supporters have left a message, this reads them for you — an overall mood, and what they want next.`}
          </p>
          {canRun && (
            <button
              type="button"
              onClick={refresh}
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center rounded-pill bg-dark-green px-5 text-[13px] font-semibold text-white transition-colors hover:bg-positive disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Reading…" : "Read my messages"}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-end gap-4">
            <div>
              <div
                className={`display text-[44px] tabular-nums leading-none ${tone.ink}`}
                style={{ fontWeight: 900 }}
              >
                {insight.happinessScore}
              </div>
              <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-gray">
                Fan happiness
              </p>
            </div>
            <div className="flex-1 pb-1">
              <div
                className="h-2 w-full overflow-hidden rounded-pill bg-light-surface"
                role="img"
                aria-label={`Fan happiness ${insight.happinessScore} out of 100`}
              >
                <div
                  className={`h-full rounded-pill ${tone.bar}`}
                  style={{ width: `${insight.happinessScore}%` }}
                />
              </div>
              <p className="mt-2 text-[13px] font-semibold text-near-black">
                {MOOD_LABEL[insight.mood] ?? insight.mood}
                {insight.confidence === "low" && (
                  <span className="ml-2 font-medium text-gray">
                    · early read, few messages
                  </span>
                )}
              </p>
            </div>
          </div>

          <p className="text-[14px] leading-[1.6] text-warm-dark">
            {insight.summary}
          </p>

          {wants.length > 0 && (
            <div>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-warm-dark">
                What they want next
              </p>
              <ul className="space-y-2">
                {wants.map((want, index) => (
                  <li
                    key={`${want.topic}-${index}`}
                    className="rounded-2xl bg-mint-surface px-4 py-3"
                  >
                    <p className="text-[14px] font-semibold text-near-black">
                      {want.topic}
                    </p>
                    {want.evidence && (
                      <p className="mt-1 text-[12px] leading-[1.5] text-warm-dark">
                        “{want.evidence}”
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={refresh}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center rounded-pill border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-4 text-[13px] font-semibold text-near-black transition-colors hover:border-near-black disabled:opacity-60"
            >
              {isPending
                ? "Reading…"
                : isStale && !dismissedStale
                  ? "New messages — read again"
                  : "Read again"}
            </button>
            <span className="text-[12px] text-gray">
              Read {formatBdtDate(insight.createdAt)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
