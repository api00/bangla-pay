"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "outline";
  disabled?: boolean;
}

export default function SubmitButton({
  label,
  pendingLabel,
  variant = "primary",
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  const className =
    variant === "primary"
      ? "inline-flex items-center justify-center h-11 px-6 rounded-full bg-[#9fe870] text-[#163300] text-[14px] font-semibold hover:bg-[#cdffad] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_1px_0_0_rgba(22,51,0,0.18),0_8px_24px_-12px_rgba(159,232,112,0.7)]"
      : "inline-flex items-center justify-center h-11 px-6 rounded-full bg-white border border-[rgba(14,15,12,0.12)] text-[#0e0f0c] text-[14px] font-semibold hover:border-[#0e0f0c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <button type="submit" disabled={isDisabled} className={className}>
      {pending ? pendingLabel ?? "Saving…" : label}
    </button>
  );
}
