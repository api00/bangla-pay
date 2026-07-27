import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  body?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  body,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] px-6 py-12 text-center shadow-[0_1px_0_0_rgba(14,15,12,0.03)]">
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-mint-surface text-dark-green inline-flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-[16px] font-semibold text-near-black">{title}</h3>
      {body && (
        <p className="mt-1.5 text-[13px] text-gray max-w-sm mx-auto leading-[1.55]">
          {body}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
