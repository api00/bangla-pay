"use client";

import { useState, useTransition } from "react";

import { setProductPublished } from "@/app/dashboard/shop/_actions/publish-product";

interface PublishToggleProps {
  productId: string;
  isPublished: boolean;
}

export default function PublishToggle({
  productId,
  isPublished: initial,
}: PublishToggleProps) {
  const [isPublished, setIsPublished] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !isPublished;
    setError(null);
    startTransition(async () => {
      const result = await setProductPublished({ productId, publish: next });
      if (!result.ok) {
        setError(result.error ?? "Couldn't update.");
        return;
      }
      setIsPublished(next);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={isPublished}
        className={[
          "inline-flex items-center gap-2 h-10 px-4 rounded-full text-[13px] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
          isPublished
            ? "bg-[#163300] text-white hover:bg-[#0e2400]"
            : "bg-[#9fe870] text-[#163300] hover:bg-[#cdffad]",
        ].join(" ")}
      >
        <span
          className={[
            "w-2 h-2 rounded-full",
            isPublished ? "bg-[#9fe870]" : "bg-[#163300]",
          ].join(" ")}
          aria-hidden
        />
        {pending ? "…" : isPublished ? "Published" : "Publish"}
      </button>
      {error && (
        <p
          role="alert"
          className="text-[12px] font-medium text-[#da291c] leading-[1.4] max-w-[280px]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
