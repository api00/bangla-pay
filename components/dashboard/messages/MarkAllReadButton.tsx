"use client";

import { useTransition } from "react";

import { markAllMessagesRead } from "@/app/dashboard/messages/_actions";

export default function MarkAllReadButton({ disabled }: { disabled: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={disabled || isPending}
      onClick={() =>
        startTransition(async () => {
          await markAllMessagesRead();
        })
      }
      className="inline-flex items-center h-10 px-4 rounded-full bg-white border border-[rgba(14,15,12,0.08)] text-[13px] font-semibold text-[#0e0f0c] hover:border-[#0e0f0c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? "Marking…" : "Mark all read"}
    </button>
  );
}
