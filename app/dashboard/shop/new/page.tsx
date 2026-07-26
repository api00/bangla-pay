import Link from "next/link";

import ProductWizard from "@/components/shop/wizard/ProductWizard";

export const metadata = {
  title: "New product · BanglaPay",
};

export default function DashboardNewProductPage() {
  return (
    <div className="max-w-[760px] space-y-6">
      <header>
        <Link
          href="/dashboard/shop"
          className="text-[13px] font-semibold text-[#454745] hover:text-[#0e0f0c]"
        >
          ← Back to shop
        </Link>
        <h1
          className="display mt-3 text-[28px] text-[#0e0f0c] md:text-[36px]"
          style={{ lineHeight: 1.1, fontWeight: 700 }}
        >
          New product
        </h1>
        <p className="mt-1 text-[14px] text-[#454745]">
          Three steps. Nothing goes live until you publish.
        </p>
      </header>

      <ProductWizard />
    </div>
  );
}
