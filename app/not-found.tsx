import Link from "next/link";

export const metadata = {
  title: "Page not found · BanglaPay",
};

export default function RootNotFound() {
  return (
    <main className="min-h-screen bg-[#f7f9f5] flex items-center justify-center px-6">
      <div className="max-w-[480px] w-full text-center space-y-6">
        <div
          className="display text-[88px] sm:text-[112px] text-[#9fe870] tabular-nums"
          style={{ lineHeight: 1, fontWeight: 900 }}
          aria-hidden
        >
          404
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#868685]">
          Page not found
        </p>
        <h1
          className="display text-[32px] sm:text-[40px] text-[#0e0f0c]"
          style={{ lineHeight: 1.05, fontWeight: 700 }}
        >
          We couldn&rsquo;t find that page.
        </h1>
        <p className="text-[15px] text-[#454745] leading-[1.55]">
          The link may be broken, the page may have moved, or you may have
          mistyped the URL.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="h-12 px-6 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[15px] inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)]"
          >
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="h-12 px-6 rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[#0e0f0c] font-semibold text-[15px] inline-flex items-center justify-center gap-2 hover:border-[#0e0f0c] transition-colors"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
