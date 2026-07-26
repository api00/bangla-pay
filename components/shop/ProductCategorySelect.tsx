import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from "@/lib/product-catalog";

interface ProductCategorySelectProps {
  defaultValue?: ProductCategory | null;
}

export default function ProductCategorySelect({
  defaultValue,
}: ProductCategorySelectProps) {
  return (
    <div>
      <label
        htmlFor="category"
        className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745]"
      >
        Product category
      </label>
      <div className="relative">
        <select
          id="category"
          name="category"
          required
          defaultValue={defaultValue ?? ""}
          aria-describedby="category-help"
          className="h-12 w-full appearance-none rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-4 pr-11 text-[16px] font-semibold text-[#0e0f0c] outline-none transition-colors focus-visible:border-[#163300] focus-visible:ring-2 focus-visible:ring-[#9fe870]"
        >
          <option value="" disabled>
            Choose a category
          </option>
          {PRODUCT_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label} — {category.formats}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#454745]"
        >
          <path
            d="m6 8 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p
        id="category-help"
        className="mt-2 text-[13px] leading-[1.5] text-[#454745]"
      >
        BanglaPay currently supports e-books, audio, and design or image packs.
      </p>
    </div>
  );
}
