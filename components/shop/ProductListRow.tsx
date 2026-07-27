import Link from "next/link";

import type { ProductWithStats } from "@/db/queries/products";
import { formatBytes } from "@/lib/bytes";
import { timeAgo } from "@/lib/dates";
import { getDeliveryMode } from "@/lib/product-catalog";

import ProductActionsMenu from "./ProductActionsMenu";
import ProductCategoryBadge from "./ProductCategoryBadge";
import ProductStatusDot from "./ProductStatusDot";
import PublishToggle from "./PublishToggle";
import { priceLabel, readinessIssue } from "./ProductCard";

interface ProductListRowProps {
  product: ProductWithStats;
  handle: string;
}

export default function ProductListRow({
  product,
  handle,
}: ProductListRowProps) {
  const issue = readinessIssue(product);

  return (
    <article className="flex flex-wrap items-center gap-4 border-b border-[rgba(14,15,12,0.06)] bg-white px-4 py-4 first:rounded-t-[24px] last:border-b-0 last:rounded-b-[24px] sm:flex-nowrap sm:px-5">
      {product.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.coverUrl}
          alt=""
          className="h-14 w-20 shrink-0 rounded-xl bg-[#f2f6ec] object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#cdffad] to-[#e2f6d5]"
        >
          <span className="text-[20px] font-bold text-[#163300]">
            {product.title.trim()[0]?.toUpperCase() ?? "•"}
          </span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-[15px] font-semibold text-[#0e0f0c]">
            {product.title}
          </h3>
          <ProductStatusDot isPublished={product.isPublished} />
          {issue && (
            <span className="inline-flex min-h-7 items-center rounded-full bg-[#fff4d9] px-2.5 text-[11px] font-semibold text-[#7a5b00]">
              {issue}
            </span>
          )}
        </div>

        <p className="mt-1 truncate text-[12px] text-[#868685]">
          /{handle}/shop/{product.slug}
        </p>

        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#868685]">
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

      <div className="hidden shrink-0 flex-wrap gap-2 lg:flex">
        {product.category && <ProductCategoryBadge category={product.category} />}
        <span className="inline-flex min-h-7 items-center rounded-full border border-[rgba(14,15,12,0.1)] bg-[#f7f9f5] px-3 text-[12px] font-semibold text-[#454745]">
          {getDeliveryMode(product.deliveryMode).shortLabel}
        </span>
      </div>

      <span className="shrink-0 text-[14px] font-semibold tabular-nums text-[#163300] sm:w-[110px] sm:text-right">
        {priceLabel(product)}
      </span>

      <div className="flex shrink-0 items-center gap-2">
        <PublishToggle
          productId={product.id}
          isPublished={product.isPublished}
        />
        <Link
          href={`/dashboard/shop/${product.id}/edit`}
          className="hidden text-[13px] font-semibold text-[#454745] hover:text-[#0e0f0c] sm:inline"
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
    </article>
  );
}
