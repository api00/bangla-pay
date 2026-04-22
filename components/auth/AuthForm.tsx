type AuthFormProps = {
  submitLabel?: string;
};

export default function AuthForm({
  submitLabel = "Continue with email",
}: AuthFormProps) {
  return (
    <div className="space-y-5">
      {/* Google */}
      <button
        type="button"
        className="w-full h-12 rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[15px] font-semibold text-[#0e0f0c] inline-flex items-center justify-center gap-3 hover:border-[#0e0f0c] transition-colors"
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
      <form className="space-y-3" action="#">
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
            placeholder="you@example.com"
            autoComplete="email"
            required
            aria-label="Email address"
            className="w-full h-12 rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white pl-11 pr-4 text-[15px] font-medium text-[#0e0f0c] placeholder:text-[#868685] outline-none focus:border-[#0e0f0c] transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full h-12 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[15px] inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)]"
        >
          {submitLabel}
          <span aria-hidden>→</span>
        </button>
      </form>

      <p className="text-[12px] text-[#868685] leading-[1.55]">
        No password needed. We&rsquo;ll send a one-time code to your inbox &mdash; works for both new and existing accounts.
      </p>
    </div>
  );
}
