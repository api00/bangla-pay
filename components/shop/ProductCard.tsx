import Link from "next/link";

import type { ProductWithStats } from "@/db/queries/products";
import { formatBytes } from "@/lib/bytes";
import { timeAgo } from "@/lib/dates";
import { formatTaka } from "@/lib/money";
import { getDeliveryMode } from "@/lib/product-catalog";

import ProductActionsMenu from "./ProductActionsMenu";
import ProductCategoryBadge from "./ProductCategoryBadge";
import ProductStatusDot from "./ProductStatusDot";
import PublishToggle from "./PublishToggle";

interface ProductCardProps {
  product: ProductWithStats;
  handle: string;
}

export function priceLabel(product: ProductWithStats): string {
  if (product.pricingModel === "free") return "Free";
  if (product.pricingModel === "pay_what_you_want") {
    return `From ${formatTaka(product.minPricePaisa ?? product.basePricePaisa)}`;
  }
  return formatTaka(product.basePricePaisa);
}

/** Why a product can't go live yet, or null when it's ready. */
export function readinessIssue(product: ProductWithStats): string | null {
  if (product.fileCount === 0) return "No file added";
  if (!product.rightsConfirmedAt) return "Rights not confirmed";
  if (product.pricingModel !== "free" && product.basePricePaisa <= 0) {
    return "No price set";
  }
  return null;
}

export default function ProductCard({ product, handle }: ProductCardProps) {
  const issue = readinessIssue(product);

  return (
    <article className="flex flex-col overflow-hidden rounded-[24px] border border-[rgba(14,15,12,0.06)] bg-white shadow-[0_1px_0_0_rgba(14,15,12,0.03)] transition-shadow hover:shadow-[0_18px_40px_-28px_rgba(14,15,12,0.35)]">
      <div className="relative">
        {product.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.coverUrl}
            alt=""
            className="aspect-[16/10] w-full border-b border-[rgba(14,15,12,0.04)] bg-[#f2f6ec] object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex aspect-[16/10] w-full items-center justify-center border-b border-[rgba(14,15,12,0.04)] bg-gradient-to-br from-[#cdffad] to-[#e2f6d5]"
          >
            <span className="text-[40px] font-bold text-[#163300]">
              {product.title.trim()[0]?.toUpperCase() ?? "•"}
            </span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <ProductStatusDot isPublished={product.isPublished} />
          {issue && (
            <span className="inline-flex min-h-7 items-center rounded-full bg-[#fff4d9] px-2.5 text-[11px] font-semibold text-[#7a5b00] shadow-[0_1px_0_0_rgba(14,15,12,0.06)]">
              {issue}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex-1">
          {product.category && (
            <div className="mb-3 flex flex-wrap gap-2">
              <ProductCategoryBadge category={product.category} />
              <span className="inline-flex min-h-7 items-center rounded-full border border-[rgba(14,15,12,0.1)] bg-[#f7f9f5] px-3 text-[12px] font-semibold text-[#454745]">
                {getDeliveryMode(product.deliveryMode).shortLabel}
              </span>
            </div>
          )}

          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[16px] font-semibold leading-[1.3] text-[#0e0f0c]">
              {product.title}
            </h3>
            <span className="shrink-0 text-[14px] font-semibold tabular-nums text-[#163300]">
              {priceLabel(product)}
            </span>
          </div>

          {product.subtitle && (
            <p className="mt-1 line-clamp-2 text-[13px] leading-[1.5] text-[#454745]">
              {product.subtitle}
            </p>
          )}

          <p className="mt-2 truncate text-[12px] text-[#868685]">
            /{handle}/shop/{product.slug}
          </p>

          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#868685]">
            <span className="tabular-nums">
              {product.fileCount} {product.fileCount === 1 ? "file" : "files"}
              {product.totalBytes > 0 && ` · ${formatBytes(product.totalBytes)}`}
            </span>
            <span aria-hidden className="h-0.5 w-0.5 rounded-full bg-[#c8c8c7]" />
            <span className="tabular-nums">
              {product.totalSales} {product.totalSales === 1 ? "sale" : "sales"}
            </span>
            <span aria-hidden className="h-0.5 w-0.5 rounded-full bg-[#c8c8c7]" />
            <span>{timeAgo(product.updatedAt)}</span>
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <PublishToggle
            productId={product.id}
            isPublished={product.isPublished}
          />
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/shop/${product.id}/edit`}
              className="text-[13px] font-semibold text-[#454745] hover:text-[#0e0f0c]"
            >
              Edit →
            </Link>
            <ProductActionsMenu
              productId={product.id}
              handle={handle}
              slug={product.slug}
              isPublished={product.isPublished}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
