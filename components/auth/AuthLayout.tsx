import Link from "next/link";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col bg-white px-6 md:px-10 py-8 md:py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 w-fit"
        aria-label="BanglaPay home"
      >
        <span className="display text-2xl tracking-tight">banglapay</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#9fe870]" aria-hidden />
      </Link>

      <div className="flex-1 flex items-center justify-center py-10 md:py-12">
        <div className="w-full max-w-[480px]">
          <h1
            className="display whitespace-nowrap text-[28px] sm:text-[34px] md:text-[40px] lg:text-[44px]"
            style={{ lineHeight: 1.1, fontWeight: 700 }}
          >
            {title}
          </h1>
          <p className="mt-3 text-[#454745] text-[17px] md:text-[18px] leading-[1.4]">
            {subtitle}
          </p>

          <div className="mt-10">{children}</div>

          <div className="mt-8 pt-6 border-t border-[rgba(14,15,12,0.08)]">
            {footer}
          </div>
        </div>
      </div>

      <div className="text-[12px] text-[#868685] flex items-center gap-3 justify-center">
        <span>© BanglaPay</span>
        <span aria-hidden className="w-0.5 h-0.5 rounded-full bg-[#c8c8c7]" />
        <a href="#" className="hover:text-[#0e0f0c] transition-colors">
          Privacy
        </a>
        <a href="#" className="hover:text-[#0e0f0c] transition-colors">
          Terms
        </a>
      </div>
    </main>
  );
}
