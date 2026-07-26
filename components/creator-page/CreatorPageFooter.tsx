import Link from "next/link";

export default function CreatorPageFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pb-6 pt-10 text-[12px] text-[#454745]">
      <span className="inline-flex items-center gap-2">
        <span>Built with</span>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1 font-semibold text-[#0e0f0c] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
        >
          <span className="display tracking-tight">banglapay</span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-[#9fe870]" />
        </Link>
      </span>
      <span aria-hidden>·</span>
      <Link
        href="/copyright"
        className="inline-flex min-h-11 items-center font-semibold text-[#163300] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
      >
        Copyright
      </Link>
    </footer>
  );
}
