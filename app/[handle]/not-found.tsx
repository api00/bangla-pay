import Link from "next/link";

export default function HandleNotFound() {
  return (
    <main className="min-h-screen bg-[#f7f9f5] flex items-center justify-center px-6">
      <div className="max-w-[420px] w-full text-center space-y-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#868685]">
          404 · No page here
        </p>
        <h1
          className="display text-[36px] sm:text-[44px] text-[#0e0f0c]"
          style={{ lineHeight: 1.05, fontWeight: 700 }}
        >
          That handle isn&rsquo;t taken yet.
        </h1>
        <p className="text-[15px] text-[#454745] leading-[1.55]">
          The creator you&rsquo;re looking for might have changed their handle,
          or this URL was never claimed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="h-12 px-6 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[15px] inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)]"
          >
            Back to home
          </Link>
          <Link
            href="/login"
            className="h-12 px-6 rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[#0e0f0c] font-semibold text-[15px] inline-flex items-center justify-center gap-2 hover:border-[#0e0f0c] transition-colors"
          >
            Claim this handle
          </Link>
        </div>
      </div>
    </main>
  );
}
