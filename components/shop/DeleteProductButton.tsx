"use client";

import { useState, useTransition } from "react";

import { deleteProduct } from "@/app/dashboard/shop/_actions/delete-product";

interface DeleteProductButtonProps {
  productId: string;
}

export default function DeleteProductButton({
  productId,
}: DeleteProductButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function fire() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProduct({ productId });
      if (result && !result.ok) {
        setError(result.error ?? "Couldn't delete.");
        setConfirming(false);
      }
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-[13px] font-semibold text-[#da291c] hover:underline underline-offset-4"
      >
        Delete product
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] text-[#454745]">
        Sure? This can&rsquo;t be undone.
      </span>
      <button
        type="button"
        onClick={fire}
        disabled={pending}
        className="h-9 px-4 rounded-full bg-[#da291c] text-white text-[13px] font-semibold disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-[13px] font-semibold text-[#454745] hover:text-[#0e0f0c]"
      >
        Cancel
      </button>
      {error && (
        <p
          role="alert"
          className="text-[12px] font-medium text-[#da291c]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
