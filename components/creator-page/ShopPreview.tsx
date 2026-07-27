import Link from "next/link";

import type { Product } from "@/db/schema";
import { formatTaka } from "@/lib/money";

interface ShopPreviewProps {
  handle: string;
  displayName: string;
  products: Product[];
}

function priceLabel(product: Product): string {
  if (product.pricingModel === "free") return "Free";
  if (product.pricingModel === "pay_what_you_want") {
    return `From ${formatTaka(product.minPricePaisa ?? product.basePricePaisa)}`;
  }
  return formatTaka(product.basePricePaisa);
}

export default function ShopPreview({
  handle,
  displayName,
  products,
}: ShopPreviewProps) {
  if (products.length === 0) {
    return (
      <section aria-labelledby="shop-preview" className="space-y-4">
        <h2
          id="shop-preview"
          className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gray"
        >
          Shop
        </h2>
        <div className="rounded-3xl border border-dashed border-[rgba(14,15,12,0.14)] bg-off-white px-6 py-10 text-center">
          <p className="text-[15px] font-semibold text-near-black">
            {displayName}&rsquo;s shop is opening soon.
          </p>
          <p className="mt-1 text-[13px] text-warm-dark leading-[1.55] max-w-[360px] mx-auto">
            Digital downloads, presets, and printable goodies — straight from
            the maker.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="shop-preview" className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2
          id="shop-preview"
          className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gray"
        >
          Shop
        </h2>
        <Link
          href={`/${handle}/shop`}
          className="text-[13px] font-semibold text-dark-green underline underline-offset-4 decoration-wise-green decoration-[2px] hover:decoration-pastel-green"
        >
          View all →
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {products.map((product) => (
          <li key={product.id}>
            <Link
              href={`/${handle}/shop/${product.slug}`}
              className="group flex gap-3 rounded-2xl border border-[rgba(14,15,12,0.06)] bg-white p-3 hover:border-near-black transition-colors h-full"
            >
              <ProductThumb product={product} />
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <p className="text-[14px] font-semibold text-near-black leading-[1.4] line-clamp-2">
                    {product.title}
                  </p>
                  {product.subtitle && (
                    <p className="mt-1 text-[12px] text-warm-dark leading-[1.4] line-clamp-1">
                      {product.subtitle}
                    </p>
                  )}
                </div>
                <span className="text-[13px] font-semibold tabular-nums text-dark-green">
                  {priceLabel(product)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProductThumb({ product }: { product: Product }) {
  if (product.coverUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.coverUrl}
        alt=""
        className="w-20 h-20 shrink-0 rounded-xl object-cover bg-mint-surface border border-[rgba(14,15,12,0.04)]"
      />
    );
  }
  const letter = product.title.trim()[0]?.toUpperCase() ?? "•";
  return (
    <div
      aria-hidden
      className="w-20 h-20 shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-br from-pastel-green to-light-mint text-dark-green text-[24px] font-bold"
    >
      {letter}
    </div>
  );
}
