import type { ReactNode } from "react";

interface CardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Card({ title, description, children, footer }: CardProps) {
  return (
    <section className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] shadow-[0_1px_0_0_rgba(14,15,12,0.03)] overflow-hidden">
      <header className="px-6 md:px-7 pt-6 pb-5 border-b border-[rgba(14,15,12,0.05)]">
        <h2 className="text-[16px] font-semibold tracking-tight text-near-black">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[13px] text-gray leading-[1.55]">
            {description}
          </p>
        )}
      </header>
      <div className="px-6 md:px-7 py-6">{children}</div>
      {footer && (
        <footer className="px-6 md:px-7 py-4 bg-off-white border-t border-[rgba(14,15,12,0.05)] flex items-center justify-end gap-3 flex-wrap">
          {footer}
        </footer>
      )}
    </section>
  );
}
