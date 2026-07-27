import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export default function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[12px] font-semibold uppercase tracking-[0.16em] text-warm-dark block"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[12px] text-heritage-red-ink font-medium">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-gray">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full h-11 px-4 rounded-2xl border border-[rgba(14,15,12,0.1)] bg-white text-[14px] text-near-black placeholder:text-gray focus:outline-none focus:border-dark-green focus:ring-2 focus:ring-wise-green/40";

export const textareaClass =
  "w-full px-4 py-3 rounded-2xl border border-[rgba(14,15,12,0.1)] bg-white text-[14px] text-near-black placeholder:text-gray focus:outline-none focus:border-dark-green focus:ring-2 focus:ring-wise-green/40 resize-y";

export const selectClass =
  "w-full h-11 px-4 rounded-2xl border border-[rgba(14,15,12,0.1)] bg-white text-[14px] text-near-black focus:outline-none focus:border-dark-green focus:ring-2 focus:ring-wise-green/40";
