"use client";

import { useState } from "react";

export function LibraryCodeCard({
  code,
  email,
}: {
  code: string;
  email: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section
      aria-labelledby="save-code-title"
      className="mb-8 rounded-[24px] border border-[rgba(22,51,0,0.12)] bg-light-mint p-5 sm:p-6"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dark-green">
        Your permanent Library Code
      </p>
      <h2
        id="save-code-title"
        className="mt-2 text-[20px] font-semibold text-near-black"
      >
        Save this once. Use it for every purchase.
      </h2>
      <p className="mt-2 text-[13px] leading-[1.55] text-warm-dark">
        Future purchases made with {email} will appear under this same code.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <code className="flex min-h-12 flex-1 items-center rounded-xl border border-[rgba(22,51,0,0.12)] bg-white px-4 text-[15px] font-semibold tracking-[0.08em] text-near-black">
          {code}
        </code>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-dark-green px-6 text-[13px] font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green motion-reduce:transform-none"
        >
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {copied ? "Library Code copied." : ""}
      </p>
    </section>
  );
}
