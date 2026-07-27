import Link from "next/link";

import ProductCard from "@/components/shop/ProductCard";
import ProductListRow from "@/components/shop/ProductListRow";
import ShopToolbar, { type ShopView } from "@/components/shop/ShopToolbar";
import { listProductsWithStats } from "@/db/queries/products";
import { isProductSort } from "@/lib/product-sort";
import { requireCreator } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Shop · BanglaPay",
};

interface PageProps {
  searchParams: Promise<{ sort?: string; view?: string }>;
}

export default async function DashboardShopPage({ searchParams }: PageProps) {
  const { creator } = await requireCreator();
  const params = await searchParams;

  const sort = isProductSort(params.sort) ? params.sort : "updated";
  const view: ShopView = params.view === "list" ? "list" : "grid";

  const products = await listProductsWithStats(creator.id, sort);
  const publishedCount = products.filter((p) => p.isPublished).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1
            className="display text-[28px] text-near-black md:text-[36px]"
            style={{ lineHeight: 1.1, fontWeight: 700 }}
          >
            Shop
          </h1>
          <p className="mt-1 max-w-[620px] text-[14px] leading-[1.55] text-warm-dark">
            Sell original files delivered online after purchase: e-books,
            audio, or design and image packs.
          </p>
        </div>
        <Link
          href="/dashboard/shop/new"
          className="inline-flex h-11 items-center justify-center rounded-full bg-wise-green px-5 text-[14px] font-semibold text-dark-green shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          + New product
        </Link>
      </header>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[rgba(14,15,12,0.14)] bg-white px-8 py-12 text-center">
          <p className="text-[16px] font-semibold text-near-black">
            No products yet.
          </p>
          <p className="mx-auto mt-1 max-w-[400px] text-[14px] leading-[1.55] text-warm-dark">
            Add an e-book, audio product, or design pack and deliver it
            securely after purchase.
          </p>
          <Link
            href="/dashboard/shop/new"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-dark-green px-5 text-[14px] font-semibold text-white"
          >
            Add your first product
          </Link>
        </div>
      ) : (
        <>
          <ShopToolbar
            sort={sort}
            view={view}
            total={products.length}
            published={publishedCount}
          />

          {view === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  handle={creator.handle}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-[rgba(14,15,12,0.06)] bg-white">
              {products.map((product) => (
                <ProductListRow
                  key={product.id}
                  product={product}
                  handle={creator.handle}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
