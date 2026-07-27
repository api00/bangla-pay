"use client";

export interface WizardStepMeta {
  id: number;
  label: string;
  hint: string;
}

interface WizardProgressProps {
  steps: readonly WizardStepMeta[];
  current: number;
  /** Highest step reached — earlier steps stay clickable. */
  furthest: number;
  onJump: (step: number) => void;
}

export default function WizardProgress({
  steps,
  current,
  furthest,
  onJump,
}: WizardProgressProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-start gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const isDone = step.id < current;
          const isCurrent = step.id === current;
          const canJump = step.id <= furthest && !isCurrent;

          return (
            <li key={step.id} className="flex flex-1 items-start gap-2 sm:gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => canJump && onJump(step.id)}
                    disabled={!canJump}
                    aria-current={isCurrent ? "step" : undefined}
                    className={[
                      "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-colors",
                      isCurrent
                        ? "bg-dark-green text-white"
                        : isDone
                          ? "bg-wise-green text-dark-green"
                          : "bg-light-surface text-gray",
                      canJump
                        ? "cursor-pointer hover:opacity-90"
                        : "cursor-default",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green",
                    ].join(" ")}
                  >
                    {isDone ? (
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden
                        className="h-4 w-4"
                      >
                        <path
                          d="m5 10 3.5 3.5L15 7"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      step.id
                    )}
                    <span className="sr-only">
                      {isDone ? "Completed: " : ""}
                      {step.label}
                    </span>
                  </button>

                  {index < steps.length - 1 && (
                    <span
                      aria-hidden
                      className={[
                        "hidden h-[2px] flex-1 rounded-full sm:block",
                        step.id < current ? "bg-wise-green" : "bg-light-surface",
                      ].join(" ")}
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={[
                      "truncate text-[13px] font-semibold",
                      isCurrent ? "text-near-black" : "text-gray",
                    ].join(" ")}
                  >
                    {step.label}
                  </p>
                  <p className="hidden truncate text-[12px] text-gray sm:block">
                    {step.hint}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
