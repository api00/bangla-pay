import Link from "next/link";
import { notFound } from "next/navigation";

import CreatorPageFooter from "@/components/creator-page/CreatorPageFooter";
import ProductCategoryBadge from "@/components/shop/ProductCategoryBadge";
import { getCreatorByHandle } from "@/db/queries/creators";
import { listPublishedProducts } from "@/db/queries/products";
import { normalizeHandle, RESERVED_HANDLES } from "@/lib/handle";
import { formatTaka } from "@/lib/money";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ handle: string }>;
}

function priceLabel(product: {
  pricingModel: "fixed" | "pay_what_you_want" | "free";
  basePricePaisa: number;
  minPricePaisa: number | null;
}): string {
  if (product.pricingModel === "free") return "Free";
  if (product.pricingModel === "pay_what_you_want") {
    return `From ${formatTaka(product.minPricePaisa ?? product.basePricePaisa)}`;
  }
  return formatTaka(product.basePricePaisa);
}

export default async function PublicShopPage({ params }: PageProps) {
  const { handle: rawHandle } = await params;
  const handle = normalizeHandle(rawHandle);
  if (!handle || RESERVED_HANDLES.has(handle)) notFound();

  const creator = await getCreatorByHandle(handle);
  if (!creator) notFound();

  const products = await listPublishedProducts(creator.id);

  return (
    <main className="min-h-screen bg-off-white">
      <div className="max-w-[860px] mx-auto px-5 sm:px-6 py-10 md:py-14 space-y-8">
        <header className="flex items-baseline justify-between flex-wrap gap-3">
          <div>
            <Link
              href={`/${handle}`}
              className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gray hover:text-near-black"
            >
              ← {creator.displayName}
            </Link>
            <h1
              className="display mt-3 text-[32px] sm:text-[40px] text-near-black"
              style={{ lineHeight: 1.1, fontWeight: 700 }}
            >
              Shop
            </h1>
          </div>
        </header>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[rgba(14,15,12,0.14)] bg-white px-6 py-12 text-center">
            <p className="text-[15px] font-semibold text-near-black">
              {creator.displayName} hasn&rsquo;t added any products yet.
            </p>
            <p className="mt-1 text-[13px] text-warm-dark leading-[1.55]">
              Come back soon — or{" "}
              <Link
                href={`/${handle}`}
                className="font-semibold text-dark-green underline underline-offset-4 decoration-wise-green decoration-[2px]"
              >
                support them with a tip
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/${handle}/shop/${product.slug}`}
                  className="block rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] hover:border-near-black transition-colors h-full overflow-hidden"
                >
                  {product.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.coverUrl}
                      alt=""
                      className="w-full aspect-[16/10] object-cover bg-mint-surface border-b border-[rgba(14,15,12,0.04)]"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="w-full aspect-[16/10] flex items-center justify-center bg-gradient-to-br from-pastel-green to-light-mint border-b border-[rgba(14,15,12,0.04)]"
                    >
                      <span className="text-[40px] font-bold text-dark-green">
                        {product.title.trim()[0]?.toUpperCase() ?? "•"}
                      </span>
                    </div>
                  )}
                  <div className="p-5">
                    {product.category && (
                      <div className="mb-3">
                        <ProductCategoryBadge category={product.category} />
                      </div>
                    )}
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[16px] font-semibold text-near-black leading-[1.3]">
                        {product.title}
                      </h3>
                      <span className="text-[14px] font-semibold tabular-nums text-dark-green shrink-0">
                        {priceLabel(product)}
                      </span>
                    </div>
                    {product.subtitle && (
                      <p className="mt-2 text-[13px] text-warm-dark leading-[1.5] line-clamp-2">
                        {product.subtitle}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <CreatorPageFooter />
      </div>
    </main>
  );
}
