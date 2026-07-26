import Link from "next/link";

import CreateProductForm from "@/components/shop/CreateProductForm";

export const metadata = {
  title: "New product · BanglaPay",
};

export default function DashboardNewProductPage() {
  return (
    <div className="space-y-6 max-w-[680px]">
      <header>
        <Link
          href="/dashboard/shop"
          className="text-[13px] font-semibold text-[#454745] hover:text-[#0e0f0c]"
        >
          ← Back to shop
        </Link>
        <h1
          className="display mt-3 text-[28px] md:text-[36px] text-[#0e0f0c]"
          style={{ lineHeight: 1.1, fontWeight: 700 }}
        >
          New product
        </h1>
        <p className="text-[14px] text-[#454745] mt-1">
          A digital product is an original file delivered online after
          purchase. Choose one category now, then add its files and cover.
        </p>
      </header>
      <CreateProductForm />
    </div>
  );
}
