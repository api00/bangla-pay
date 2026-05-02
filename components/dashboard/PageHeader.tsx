import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="flex items-baseline justify-between flex-wrap gap-3">
      <div>
        <h1
          className="display text-[28px] md:text-[36px] text-[#0e0f0c]"
          style={{ lineHeight: 1.1, fontWeight: 700 }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-[14px] text-[#454745] mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  );
}
