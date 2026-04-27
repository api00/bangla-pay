import Link from "next/link";

export default function CreatorPageFooter() {
  return (
    <footer className="pt-10 pb-6 flex items-center justify-center gap-2 text-[12px] text-[#868685]">
      <span>Built with</span>
      <Link
        href="/"
        className="inline-flex items-center gap-1 font-semibold text-[#0e0f0c] hover:opacity-80 transition-opacity"
      >
        <span className="display tracking-tight">banglapay</span>
        <span aria-hidden className="w-1 h-1 rounded-full bg-[#9fe870]" />
      </Link>
    </footer>
  );
}
