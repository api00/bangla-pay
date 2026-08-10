import Link from "next/link";

import { LibraryCodeForm } from "./LibraryCodeForm";

export function LibraryCodeGate({ nextPath }: { nextPath?: string }) {
  return (
    <main className="min-h-screen bg-off-white">
      <header className="border-b border-[rgba(14,15,12,0.06)] bg-white">
        <div className="mx-auto flex max-w-[920px] items-center px-5 py-5 sm:px-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green"
          >
            <span className="display text-2xl tracking-tight">banglapay</span>
            <span className="h-1.5 w-1.5 rounded-full bg-wise-green" aria-hidden />
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-[920px] justify-center px-5 py-14 sm:px-6 md:py-20">
        <section
          aria-labelledby="library-title"
          className="w-full max-w-[500px] rounded-[28px] border border-[rgba(14,15,12,0.08)] bg-white px-6 py-8 shadow-[0_20px_60px_rgba(14,15,12,0.06)] sm:px-9 sm:py-10"
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-warm-dark">
            Private buyer access
          </p>
          <h1
            id="library-title"
            className="display mt-3 text-[36px] text-near-black sm:text-[44px]"
            style={{ lineHeight: 1, fontWeight: 700 }}
          >
            Open your private library.
          </h1>
          <p className="mt-4 text-[15px] leading-[1.6] text-warm-dark">
            Enter the code shown after your purchase. No account or password is
            needed.
          </p>
          <LibraryCodeForm nextPath={nextPath} />
          <p className="mt-6 border-t border-[rgba(14,15,12,0.08)] pt-5 text-[12px] leading-[1.55] text-warm-dark">
            Keep your code private. Anyone with it can open your purchased
            files.
          </p>
        </section>
      </div>
    </main>
  );
}
