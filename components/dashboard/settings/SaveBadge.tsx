"use client";

interface SaveBadgeProps {
  savedAt?: number;
  error?: string;
}

export default function SaveBadge({ savedAt, error }: SaveBadgeProps) {
  if (error) {
    return (
      <span className="text-[12px] font-semibold text-[#a3221a]">{error}</span>
    );
  }
  if (!savedAt) return null;

  return (
    <span
      key={savedAt}
      className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#163300] save-badge"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#9fe870]" aria-hidden />
      Saved
    </span>
  );
}
