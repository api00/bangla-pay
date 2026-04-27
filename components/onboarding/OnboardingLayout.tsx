import Link from "next/link";
import type { ReactNode } from "react";

type StepKey = "handle" | "profile" | "payout";

const STEPS: { key: StepKey; label: string }[] = [
  { key: "handle", label: "Handle" },
  { key: "profile", label: "Profile" },
  { key: "payout", label: "Payout" },
];

interface OnboardingLayoutProps {
  step: StepKey;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  /** Right-side preview / illustration. Optional. */
  aside?: ReactNode;
}

export default function OnboardingLayout({
  step,
  title,
  subtitle,
  children,
  aside,
}: OnboardingLayoutProps) {
  const activeIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <header className="px-6 md:px-10 py-6 flex items-center justify-between border-b border-[rgba(14,15,12,0.06)]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5"
          aria-label="BanglaPay home"
        >
          <span className="display text-2xl tracking-tight">banglapay</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#9fe870]" aria-hidden />
        </Link>

        <ol
          className="flex items-center gap-2 sm:gap-3"
          aria-label="Onboarding progress"
        >
          {STEPS.map((s, idx) => {
            const isActive = idx === activeIndex;
            const isDone = idx < activeIndex;
            return (
              <li key={s.key} className="flex items-center gap-2 sm:gap-3">
                <span
                  aria-current={isActive ? "step" : undefined}
                  className={[
                    "flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em]",
                    isActive ? "text-[#0e0f0c]" : "text-[#868685]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "w-6 h-6 inline-flex items-center justify-center rounded-full text-[11px] tabular-nums",
                      isDone
                        ? "bg-[#163300] text-white"
                        : isActive
                          ? "bg-[#9fe870] text-[#163300]"
                          : "bg-[#e8ebe6] text-[#868685]",
                    ].join(" ")}
                  >
                    {isDone ? "✓" : idx + 1}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </span>
                {idx < STEPS.length - 1 && (
                  <span
                    className={[
                      "w-6 sm:w-10 h-px",
                      isDone ? "bg-[#163300]" : "bg-[rgba(14,15,12,0.08)]",
                    ].join(" ")}
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>
      </header>

      <div className="flex-1 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
        <section className="px-6 md:px-10 lg:px-16 py-10 md:py-14 max-w-[640px] w-full mx-auto lg:mx-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#868685] mb-4">
            Step {activeIndex + 1} of {STEPS.length}
          </p>
          <h1
            className="display text-[32px] sm:text-[40px] md:text-[48px]"
            style={{ lineHeight: 1.05, fontWeight: 700 }}
          >
            {title}
          </h1>
          <p className="mt-4 text-[#454745] text-[17px] leading-[1.5]">
            {subtitle}
          </p>

          <div className="mt-10">{children}</div>
        </section>

        {aside && (
          <aside className="hidden lg:flex bg-[#f7f9f5] border-l border-[rgba(14,15,12,0.06)] items-center justify-center p-12">
            <div className="w-full max-w-[420px]">{aside}</div>
          </aside>
        )}
      </div>
    </main>
  );
}
