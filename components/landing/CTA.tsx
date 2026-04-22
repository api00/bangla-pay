"use client";

import { useEffect, useRef, useState } from "react";

const avatars = [
  { initial: "তা", bg: "from-[#9fe870] to-[#cdffad]", fg: "#163300", bangla: true },
  { initial: "প", bg: "from-[#e2f6d5] to-[#9fe870]", fg: "#163300", bangla: true },
  { initial: "N", bg: "from-[#054d28] to-[#163300]", fg: "#ffffff", bangla: false },
  { initial: "রু", bg: "from-[#cdffad] to-[#e2f6d5]", fg: "#163300", bangla: true },
  { initial: "M", bg: "from-[#163300] to-[#054d28]", fg: "#9fe870", bangla: false },
];

const sampleHandles = ["tahsina", "nahiyan", "priya-das", "rakib", "labiba"];

function useTypingHandle(paused: boolean) {
  const [text, setText] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        setText("your-handle");
        return;
      }
    }

    if (paused) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    let handleIdx = 0;
    let charIdx = 0;
    let deleting = false;

    const tick = () => {
      const current = sampleHandles[handleIdx];

      if (!deleting) {
        charIdx += 1;
        setText(current.slice(0, charIdx));
        if (charIdx === current.length) {
          timeoutRef.current = setTimeout(() => {
            deleting = true;
            tick();
          }, 1600);
          return;
        }
        timeoutRef.current = setTimeout(tick, 80);
      } else {
        charIdx -= 1;
        setText(current.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          handleIdx = (handleIdx + 1) % sampleHandles.length;
          timeoutRef.current = setTimeout(tick, 450);
          return;
        }
        timeoutRef.current = setTimeout(tick, 40);
      }
    };

    tick();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [paused]);

  return text;
}

export default function CTA() {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const showAnimated = !focused && value.length === 0;
  const animatedText = useTypingHandle(!showAnimated);

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <div className="rounded-[36px] bg-[#f7f9f5] border border-[rgba(14,15,12,0.08)] px-6 md:px-12 py-16 md:py-20 text-center">
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#454745]">
            Your cha jar
          </span>

          <h2
            className="display mt-5 max-w-2xl mx-auto text-[30px] sm:text-[38px] md:text-[48px] lg:text-[56px]"
            style={{ lineHeight: 1.1, fontWeight: 700 }}
          >
            Start tonight. It takes a <span className="whitespace-nowrap">minute. <span aria-hidden>⏱️</span></span>
          </h2>

          <p className="mt-5 md:mt-6 text-lg md:text-xl text-[#454745] max-w-xl mx-auto leading-[1.5]">
            Pick a handle, share the link, and start accepting cha from the people who love your work.
          </p>

          {/* Handle claimer */}
          <form
            action="#"
            className="mt-12 md:mt-14 mx-auto flex items-center gap-2 w-full max-w-[580px] rounded-full bg-white border-[1.5px] border-[#0e0f0c] p-1.5 md:p-2 shadow-[0_1px_0_0_rgba(14,15,12,0.04),0_20px_50px_-24px_rgba(159,232,112,0.45)] focus-within:shadow-[0_1px_0_0_rgba(14,15,12,0.04),0_20px_60px_-20px_rgba(159,232,112,0.7)] transition-shadow"
          >
            <span className="pl-4 md:pl-5 text-[14px] md:text-[15px] font-semibold text-[#868685] whitespace-nowrap tabular-nums">
              banglapay.com/
            </span>
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                name="handle"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                aria-label="Your handle"
                autoComplete="off"
                className="w-full bg-transparent text-[14px] md:text-[15px] font-semibold text-[#0e0f0c] outline-none px-1 py-2 relative z-10"
              />
              {showAnimated && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 flex items-center px-1 text-[14px] md:text-[15px] font-semibold text-[#868685] whitespace-nowrap overflow-hidden"
                >
                  {animatedText}
                  <span className="ml-[2px] inline-block w-[2px] h-[1em] bg-[#9fe870] align-middle animate-[blink_1s_steps(2,start)_infinite]" />
                </span>
              )}
            </div>
            <button
              type="submit"
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[14px] md:text-[15px] px-5 md:px-6 h-10 md:h-11 whitespace-nowrap transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Claim it
              <span aria-hidden>→</span>
            </button>
          </form>

          {/* Social proof */}
          <div className="mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-3">
            <div className="flex -space-x-2.5">
              {avatars.map((a, i) => (
                <span
                  key={i}
                  className={`w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br ${a.bg} ring-2 ring-white flex items-center justify-center text-[11px] md:text-[12px] font-bold ${
                    a.bangla ? "bangla-display" : ""
                  }`}
                  style={{ color: a.fg }}
                  aria-hidden
                >
                  {a.initial}
                </span>
              ))}
            </div>
            <div className="text-[14px] md:text-[15px] text-[#454745]">
              Join <span className="text-[#0e0f0c] font-semibold tabular-nums">500+</span> creators already on BanglaPay
            </div>
          </div>

          <div className="mt-6 text-[13px] md:text-[14px] text-[#868685]">
            Free. No card. No setup fee.
          </div>
        </div>
      </div>
    </section>
  );
}
