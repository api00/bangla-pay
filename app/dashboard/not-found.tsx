import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 max-w-[480px] mx-auto">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#868685]">
        404 · Not in your dashboard
      </p>
      <h1
        className="display mt-3 text-[28px] md:text-[34px] text-[#0e0f0c]"
        style={{ lineHeight: 1.1, fontWeight: 700 }}
      >
        That page doesn&rsquo;t exist.
      </h1>
      <p className="mt-3 text-[14px] text-[#454745] leading-[1.55]">
        It may have been moved, or you might be looking at someone else&rsquo;s
        link.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard"
          className="h-11 px-5 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[14px] inline-flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)]"
        >
          Dashboard home
        </Link>
        <Link
          href="/dashboard/settings"
          className="h-11 px-5 rounded-full border-[1.5px] border-[rgba(14,15,12,0.12)] bg-white text-[#0e0f0c] font-semibold text-[14px] inline-flex items-center justify-center hover:border-[#0e0f0c] transition-colors"
        >
          Settings
        </Link>
      </div>
    </div>
  );
}
