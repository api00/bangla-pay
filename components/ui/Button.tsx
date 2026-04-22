import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "dark";
type Size = "sm" | "md" | "lg" | "xl";

export interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  ariaLabel?: string;
  noHover?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-full whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163300] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const variants: Record<Variant, { base: string; hover: string }> = {
  primary: {
    base: "bg-[#9fe870] text-[#163300]",
    hover: "hover:bg-[#cdffad]",
  },
  secondary: {
    base: "bg-[rgba(22,51,0,0.08)] text-[#0e0f0c]",
    hover: "hover:bg-[rgba(22,51,0,0.14)]",
  },
  ghost: {
    base: "bg-transparent text-[#0e0f0c]",
    hover: "hover:bg-[rgba(22,51,0,0.06)]",
  },
  dark: {
    base: "bg-[#0e0f0c] text-white",
    hover: "hover:bg-[#1a1b17]",
  },
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 h-9",
  md: "text-base px-4 py-2 h-11",
  lg: "text-lg px-6 py-3 h-14",
  xl: "text-[17px] md:text-[18px] px-8 md:px-10 h-[60px] md:h-[64px]",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  type = "button",
  className = "",
  ariaLabel,
  noHover = false,
}: ButtonProps) {
  const v = variants[variant];
  const classes = [
    base,
    noHover ? "" : "press",
    v.base,
    noHover ? "" : v.hover,
    sizes[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
