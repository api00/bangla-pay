"use client";

import { useState, useTransition } from "react";

import { setProductPublished } from "@/app/dashboard/shop/_actions/publish-product";

interface DraftBannerProps {
  productId: string;
  isPublished: boolean;
  publicUrl: string;
}

export default function DraftBanner({
  productId,
  isPublished: initial,
  publicUrl,
}: DraftBannerProps) {
  const [isPublished, setIsPublished] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function publish() {
    setError(null);
    startTransition(async () => {
      const result = await setProductPublished({
        productId,
        publish: true,
      });
      if (!result.ok) {
        setError(result.error ?? "Couldn't publish.");
        return;
      }
      setIsPublished(true);
    });
  }

  if (isPublished) {
    return (
      <div className="rounded-2xl bg-[#e2f6d5] border border-[#9fe870] px-5 py-4 flex items-center gap-3 flex-wrap">
        <span className="w-8 h-8 rounded-full bg-[#163300] text-[#9fe870] inline-flex items-center justify-center text-[14px] font-bold shrink-0">
          ✓
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-[#163300]">
            Live in your shop
          </div>
          <div className="text-[12px] text-[#0e0f0c]/70 truncate">
            Visible at{" "}
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline underline-offset-2"
            >
              {publicUrl.replace("https://", "")}
            </a>
          </div>
        </div>
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[12px] font-semibold text-[#163300] underline underline-offset-4 decoration-2"
        >
          Open ↗
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#fff7e0] border border-[#f5d989] px-5 py-4 flex items-center gap-3 flex-wrap">
      <span className="w-8 h-8 rounded-full bg-[#f5d989] text-[#6b4900] inline-flex items-center justify-center text-[14px] font-bold shrink-0">
        ⋯
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-[#6b4900]">
          Draft — not visible to anyone yet
        </div>
        <div className="text-[12px] text-[#8a6d00]">
          Add files, choose a category, and confirm your rights before
          publishing.
        </div>
        {error && (
          <div className="text-[12px] font-medium text-[#a3221a] mt-1">
            {error}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={publish}
        disabled={pending}
        className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#163300] text-white text-[13px] font-semibold px-4 h-10 hover:bg-[#054d28] transition-colors disabled:opacity-60"
      >
        {pending ? "Publishing…" : "Publish now →"}
      </button>
    </div>
  );
}
