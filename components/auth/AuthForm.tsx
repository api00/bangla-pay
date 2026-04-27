"use client";

import {
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const OTP_LENGTH = 6;

type AuthFormProps = {
  submitLabel?: string;
};

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "awaiting_code"; email: string }
  | { kind: "verifying"; email: string }
  | { kind: "error"; message: string };

function genericError(): string {
  // Never leak provider-specific errors to the UI (CLAUDE.md §8).
  return "Something went wrong — please try again.";
}

function getNextParam(): string {
  if (typeof window === "undefined") return "/dashboard";
  const raw = new URLSearchParams(window.location.search).get("next");
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return "/dashboard";
  }
  return raw;
}

export default function AuthForm({
  submitLabel = "Continue with email",
}: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const codeInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  function focusBox(idx: number) {
    const bounded = Math.max(0, Math.min(OTP_LENGTH - 1, idx));
    codeInputsRef.current[bounded]?.focus();
    codeInputsRef.current[bounded]?.select();
  }

  function setCodeAt(idx: number, digit: string) {
    const next = code.padEnd(OTP_LENGTH, " ").split("");
    next[idx] = digit;
    setCode(next.join("").replace(/ /g, ""));
  }

  function handleBoxChange(idx: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setCodeAt(idx, "");
      return;
    }
    if (digits.length === 1) {
      setCodeAt(idx, digits);
      if (idx < OTP_LENGTH - 1) focusBox(idx + 1);
      return;
    }
    // Multi-digit input (autofill or fast typing): distribute across boxes.
    const chars = digits.slice(0, OTP_LENGTH - idx).split("");
    const merged = code.padEnd(OTP_LENGTH, " ").split("");
    chars.forEach((c, i) => {
      merged[idx + i] = c;
    });
    const joined = merged.join("").replace(/ /g, "");
    setCode(joined);
    const nextFocus = Math.min(idx + chars.length, OTP_LENGTH - 1);
    focusBox(nextFocus);
  }

  function handleBoxKeyDown(
    idx: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace") {
      if (code[idx]) {
        setCodeAt(idx, "");
        return;
      }
      if (idx > 0) {
        event.preventDefault();
        setCodeAt(idx - 1, "");
        focusBox(idx - 1);
      }
      return;
    }
    if (event.key === "ArrowLeft" && idx > 0) {
      event.preventDefault();
      focusBox(idx - 1);
      return;
    }
    if (event.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
      event.preventDefault();
      focusBox(idx + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    const digits = pasted.slice(0, OTP_LENGTH).split("");
    const merged = Array.from({ length: OTP_LENGTH }, (_, i) => digits[i] ?? "");
    setCode(merged.join(""));
    focusBox(Math.min(digits.length, OTP_LENGTH - 1));
  }

  const isBusy = status.kind === "submitting" || status.kind === "verifying";

  async function handleSendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;

    setErrorMsg(null);
    setStatus({ kind: "submitting" });
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      setErrorMsg(genericError());
      setStatus({ kind: "idle" });
      return;
    }

    setStatus({ kind: "awaiting_code", email });
    setCode("");
    setTimeout(() => focusBox(0), 50);
  }

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind !== "awaiting_code") return;
    const trimmed = code.trim();
    if (trimmed.length !== 6) return;

    setErrorMsg(null);
    setStatus({ kind: "verifying", email: status.email });
    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      email: status.email,
      token: trimmed,
      type: "email",
    });

    if (error) {
      setErrorMsg("That code didn't work. Check your email and try again.");
      setStatus({ kind: "awaiting_code", email: status.email });
      return;
    }

    const next = getNextParam();
    router.push(next);
    router.refresh();
  }

  async function handleResend() {
    if (status.kind !== "awaiting_code") return;
    setErrorMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: status.email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      setErrorMsg(genericError());
      return;
    }
    setCode("");
    focusBox(0);
  }

  async function handleGoogle() {
    setErrorMsg(null);
    setStatus({ kind: "submitting" });
    const supabase = createClient();
    const nextParam = getNextParam();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextParam)}`,
      },
    });
    if (error) {
      setErrorMsg(genericError());
      setStatus({ kind: "idle" });
    }
    // On success, Supabase redirects the browser.
  }

  if (status.kind === "awaiting_code" || status.kind === "verifying") {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-[15px] font-semibold text-[#0e0f0c]">
            Check your email.
          </p>
          <p className="text-[13px] text-[#454745] leading-[1.55]">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-[#0e0f0c]">{status.email}</span>
            . Enter it below to continue.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleVerifyCode}>
          <div
            role="group"
            aria-label="6-digit verification code"
            className="grid grid-cols-6 gap-2 sm:gap-3"
          >
            {Array.from({ length: OTP_LENGTH }).map((_, idx) => {
              const value = code[idx] ?? "";
              const filled = value !== "";
              return (
                <input
                  key={idx}
                  ref={(el) => {
                    codeInputsRef.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={idx === 0 ? "one-time-code" : "off"}
                  pattern="[0-9]*"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleBoxChange(idx, e.target.value)}
                  onKeyDown={(e) => handleBoxKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  onFocus={(e) => e.currentTarget.select()}
                  disabled={isBusy}
                  aria-label={`Digit ${idx + 1}`}
                  className={[
                    "aspect-square w-full rounded-xl border-[1.5px] bg-white text-center",
                    "text-[22px] sm:text-[26px] font-semibold text-[#0e0f0c] tabular-nums",
                    "outline-none transition-[border-color,box-shadow,background-color] duration-150",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    filled
                      ? "border-[#0e0f0c] bg-[#f7f9f5]"
                      : "border-[rgba(14,15,12,0.14)]",
                    "focus:border-[#0e0f0c] focus:shadow-[0_0_0_4px_rgba(159,232,112,0.35)]",
                    "caret-[#163300]",
                  ].join(" ")}
                />
              );
            })}
          </div>
          <button
            type="submit"
            disabled={isBusy || code.length !== OTP_LENGTH}
            className="w-full h-12 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[15px] inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {status.kind === "verifying" ? "Verifying…" : "Verify and continue"}
            {status.kind !== "verifying" && <span aria-hidden>→</span>}
          </button>
        </form>

        {errorMsg && (
          <p
            role="alert"
            className="text-[13px] font-medium text-[#da291c] leading-[1.55]"
          >
            {errorMsg}
          </p>
        )}

        <div className="flex items-center justify-between text-[13px]">
          <button
            type="button"
            onClick={() => {
              setStatus({ kind: "idle" });
              setCode("");
              setErrorMsg(null);
            }}
            className="font-semibold text-[#454745] underline underline-offset-4 decoration-[rgba(14,15,12,0.14)] decoration-[2px] hover:text-[#0e0f0c]"
          >
            Use a different email
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={isBusy}
            className="font-semibold text-[#163300] underline underline-offset-4 decoration-[#9fe870] decoration-[2px] hover:decoration-[#cdffad] disabled:opacity-60"
          >
            Resend code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={isBusy}
        className="w-full h-12 rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[15px] font-semibold text-[#0e0f0c] inline-flex items-center justify-center gap-3 hover:border-[#0e0f0c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
          />
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[rgba(14,15,12,0.08)]" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#868685]">
          or use email
        </span>
        <div className="flex-1 h-px bg-[rgba(14,15,12,0.08)]" />
      </div>

      {/* Email + submit */}
      <form className="space-y-3" onSubmit={handleSendCode}>
        <div className="relative">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#868685]"
            aria-hidden
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </span>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={isBusy}
            aria-label="Email address"
            className="w-full h-12 rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white pl-11 pr-4 text-[15px] font-medium text-[#0e0f0c] placeholder:text-[#868685] outline-none focus:border-[#0e0f0c] transition-colors disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={isBusy || !email}
          className="w-full h-12 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[15px] inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {status.kind === "submitting" ? "Sending code…" : submitLabel}
          {status.kind !== "submitting" && <span aria-hidden>→</span>}
        </button>
      </form>

      {errorMsg && (
        <p
          role="alert"
          className="text-[13px] font-medium text-[#da291c] leading-[1.55]"
        >
          {errorMsg}
        </p>
      )}

      <p className="text-[12px] text-[#868685] leading-[1.55]">
        No password needed. We&rsquo;ll send a one-time code to your inbox
        &mdash; works for both new and existing accounts.
      </p>
    </div>
  );
}
