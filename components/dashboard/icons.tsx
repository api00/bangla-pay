import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function HomeIcon(p: Props) {
  return (
    <svg {...base} {...p}>
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

export function PageIcon(p: Props) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
    </svg>
  );
}

export function ExternalIcon(p: Props) {
  return (
    <svg {...base} {...p}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

export function HeartIcon(p: Props) {
  return (
    <svg {...base} {...p}>
      <path d="M12 20.5s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10.5c0 5.65-7 10-7 10z" />
    </svg>
  );
}

export function ShopIcon(p: Props) {
  return (
    <svg {...base} {...p}>
      <path d="M5 7h14l-1 13H6z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function LockIcon(p: Props) {
  return (
    <svg {...base} {...p}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function PeopleIcon(p: Props) {
  return (
    <svg {...base} {...p}>
      <circle cx="9" cy="9" r="3.5" />
      <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M15 14.5c3 .3 6 2 6 5" />
    </svg>
  );
}

export function MessageIcon(p: Props) {
  return (
    <svg {...base} {...p}>
      <path d="M21 12a8 8 0 0 1-11.6 7.15L4 20l1-4.4A8 8 0 1 1 21 12z" />
    </svg>
  );
}

export function UserIcon(p: Props) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" />
    </svg>
  );
}

export function WalletIcon(p: Props) {
  return (
    <svg {...base} {...p}>
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M16 12h3" />
      <circle cx="16" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

export function BoltIcon(p: Props) {
  return (
    <svg {...base} {...p}>
      <path d="M13 3 4 14h7l-1 7 9-11h-7z" />
    </svg>
  );
}

export function BellIcon(p: Props) {
  return (
    <svg {...base} {...p}>
      <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function CheckIcon(p: Props) {
  return (
    <svg {...base} strokeWidth="2.2" {...p}>
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

export function ShareIcon(p: Props) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

export function ChevronDownIcon(p: Props) {
  return (
    <svg {...base} {...p}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function AlertIcon(p: Props) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3 2 21h20z" />
      <path d="M12 10v5" />
      <circle cx="12" cy="18" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
