import Link from "next/link";

import type { Product } from "@/db/schema";
import { formatTaka } from "@/lib/money";

import PublishToggle from "./PublishToggle";

interface ProductCardProps {
  product: Product;
  handle: string;
}

function priceLabel(product: Product): string {
  if (product.pricingModel === "free") return "Free";
  if (product.pricingModel === "pay_what_you_want") {
    return `From ${formatTaka(product.minPricePaisa ?? product.basePricePaisa)}`;
  }
  return formatTaka(product.basePricePaisa);
}

export default function ProductCard({ product, handle }: ProductCardProps) {
  return (
    <article className="rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] p-5 shadow-[0_1px_0_0_rgba(14,15,12,0.03)] flex flex-col gap-4">
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[16px] font-semibold text-[#0e0f0c] leading-[1.3]">
            {product.title}
          </h3>
          <span className="text-[14px] font-semibold tabular-nums text-[#163300] shrink-0">
            {priceLabel(product)}
          </span>
        </div>
        {product.subtitle && (
          <p className="mt-1 text-[13px] text-[#454745] leading-[1.5] line-clamp-2">
            {product.subtitle}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 text-[12px] text-[#868685]">
          <span>/{handle}/shop/{product.slug}</span>
          {product.totalSales > 0 && (
            <>
              <span aria-hidden className="w-0.5 h-0.5 rounded-full bg-[#c8c8c7]" />
              <span className="tabular-nums">{product.totalSales} sales</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <PublishToggle
          productId={product.id}
          isPublished={product.isPublished}
        />
        <Link
          href={`/dashboard/shop/${product.id}/edit`}
          className="text-[13px] font-semibold text-[#454745] hover:text-[#0e0f0c]"
        >
          Edit →
        </Link>
      </div>
    </article>
  );
}
