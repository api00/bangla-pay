import Link from "next/link";

import ProductCard from "@/components/shop/ProductCard";
import { listProductsForCreator } from "@/db/queries/products";
import { requireCreator } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Shop · BanglaPay",
};

export default async function DashboardShopPage() {
  const { creator } = await requireCreator();
  const products = await listProductsForCreator(creator.id);
  const publishedCount = products.filter((p) => p.isPublished).length;

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <h1
            className="display text-[28px] md:text-[36px] text-[#0e0f0c]"
            style={{ lineHeight: 1.1, fontWeight: 700 }}
          >
            Shop
          </h1>
          <p className="text-[14px] text-[#454745] mt-1">
            Sell digital products to your supporters.{" "}
            {products.length > 0 &&
              `${publishedCount} of ${products.length} live.`}
          </p>
        </div>
        <Link
          href="/dashboard/shop/new"
          className="inline-flex items-center justify-center h-11 px-5 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[14px] hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)]"
        >
          + New product
        </Link>
      </header>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[rgba(14,15,12,0.14)] bg-white px-8 py-12 text-center">
          <p className="text-[16px] font-semibold text-[#0e0f0c]">
            No products yet.
          </p>
          <p className="mt-1 text-[14px] text-[#454745] leading-[1.55] max-w-[400px] mx-auto">
            Add a digital download — a PDF, audio file, preset pack, or zip —
            and start selling.
          </p>
          <Link
            href="/dashboard/shop/new"
            className="mt-5 inline-flex items-center justify-center h-11 px-5 rounded-full bg-[#163300] text-white font-semibold text-[14px]"
          >
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              handle={creator.handle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
