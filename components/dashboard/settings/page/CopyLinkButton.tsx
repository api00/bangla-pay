"use client";

import { useState } from "react";

export default function CopyLinkButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center justify-center h-10 px-4 rounded-full bg-white border border-[rgba(14,15,12,0.12)] text-[13px] font-semibold text-near-black hover:border-near-black transition-colors"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
