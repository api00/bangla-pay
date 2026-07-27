import {
  getProductCategoryLabel,
  type ProductCategory,
} from "@/lib/product-catalog";

interface ProductCategoryBadgeProps {
  category: ProductCategory | null;
}

export default function ProductCategoryBadge({
  category,
}: ProductCategoryBadgeProps) {
  if (!category) return null;

  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-[rgba(22,51,0,0.12)] bg-light-mint px-3 text-[12px] font-semibold text-dark-green">
      {getProductCategoryLabel(category)}
    </span>
  );
}
