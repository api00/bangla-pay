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
          className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#868685]"
        >
          Shop
        </h2>
        <div className="rounded-3xl border border-dashed border-[rgba(14,15,12,0.14)] bg-[#f7f9f5] px-6 py-10 text-center">
          <p className="text-[15px] font-semibold text-[#0e0f0c]">
            {displayName}&rsquo;s shop is opening soon.
          </p>
          <p className="mt-1 text-[13px] text-[#454745] leading-[1.55] max-w-[360px] mx-auto">
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
          className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#868685]"
        >
          Shop
        </h2>
        <Link
          href={`/${handle}/shop`}
          className="text-[13px] font-semibold text-[#163300] underline underline-offset-4 decoration-[#9fe870] decoration-[2px] hover:decoration-[#cdffad]"
        >
          View all →
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {products.map((product) => (
          <li key={product.id}>
            <Link
              href={`/${handle}/shop/${product.slug}`}
              className="block rounded-2xl border border-[rgba(14,15,12,0.06)] bg-white px-5 py-4 hover:border-[#0e0f0c] transition-colors h-full"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[14px] font-semibold text-[#0e0f0c] leading-[1.4] line-clamp-2">
                  {product.title}
                </p>
                <span className="text-[13px] font-semibold tabular-nums text-[#163300] shrink-0">
                  {priceLabel(product)}
                </span>
              </div>
              {product.subtitle && (
                <p className="mt-1 text-[12px] text-[#454745] leading-[1.5] line-clamp-1">
                  {product.subtitle}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
