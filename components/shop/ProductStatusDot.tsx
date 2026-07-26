interface ProductStatusDotProps {
  isPublished: boolean;
}

/** Live / Draft pill. Shared by the grid card and the list row. */
export default function ProductStatusDot({
  isPublished,
}: ProductStatusDotProps) {
  return (
    <span
      className={[
        "inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold shadow-[0_1px_0_0_rgba(14,15,12,0.06)]",
        isPublished
          ? "bg-[#163300] text-white"
          : "bg-white text-[#454745] ring-1 ring-[rgba(14,15,12,0.12)]",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "h-1.5 w-1.5 rounded-full",
          isPublished ? "bg-[#9fe870]" : "bg-[#868685]",
        ].join(" ")}
      />
      {isPublished ? "Live" : "Draft"}
    </span>
  );
}
