import Link from "next/link";

export default function CreatorPageFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pb-6 pt-10 text-[12px] text-warm-dark">
      <span className="inline-flex items-center gap-2">
        <span>Built with</span>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1 font-semibold text-near-black transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green"
        >
          <span className="display tracking-tight">banglapay</span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-wise-green" />
        </Link>
      </span>
      <span aria-hidden>·</span>
      <Link
        href="/copyright"
        className="inline-flex min-h-11 items-center font-semibold text-dark-green underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green"
      >
        Copyright
      </Link>
    </footer>
  );
}
