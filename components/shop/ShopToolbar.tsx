"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PRODUCT_SORTS, type ProductSort } from "@/lib/product-sort";

export type ShopView = "grid" | "list";

interface ShopToolbarProps {
  sort: ProductSort;
  view: ShopView;
  total: number;
  published: number;
}

export default function ShopToolbar({
  sort,
  view,
  total,
  published,
}: ShopToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sort and view live in the URL so the state is shareable and survives a
  // reload or a back-navigation from the edit screen.
  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set(key, value);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(14,15,12,0.06)] bg-white px-4 py-3">
      <p className="text-[13px] font-semibold text-warm-dark tabular-nums">
        {total} {total === 1 ? "product" : "products"}
        <span className="text-gray"> · {published} live</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="shop-sort" className="sr-only">
          Sort products
        </label>
        <div className="relative">
          <select
            id="shop-sort"
            value={sort}
            onChange={(event) => setParam("sort", event.target.value)}
            className="h-10 appearance-none rounded-full border border-[rgba(14,15,12,0.12)] bg-white pl-4 pr-9 text-[13px] font-semibold text-near-black outline-none transition-colors hover:border-near-black focus-visible:border-dark-green focus-visible:ring-2 focus-visible:ring-wise-green"
          >
            {PRODUCT_SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            fill="none"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-dark"
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

        <div
          role="group"
          aria-label="View"
          className="inline-flex h-10 items-center gap-0.5 rounded-full border border-[rgba(14,15,12,0.12)] bg-off-white p-1"
        >
          {(
            [
              { value: "grid", label: "Grid" },
              { value: "list", label: "List" },
            ] as const
          ).map((option) => {
            const active = view === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setParam("view", option.value)}
                title={`${option.label} view`}
                className={[
                  "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-colors",
                  active
                    ? "bg-white text-near-black shadow-[0_1px_0_0_rgba(14,15,12,0.06)]"
                    : "text-gray hover:text-near-black",
                ].join(" ")}
              >
                {option.value === "grid" ? (
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                    <rect x="1" y="1" width="6" height="6" rx="1.5" />
                    <rect x="9" y="1" width="6" height="6" rx="1.5" />
                    <rect x="1" y="9" width="6" height="6" rx="1.5" />
                    <rect x="9" y="9" width="6" height="6" rx="1.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                    <rect x="1" y="2" width="14" height="3" rx="1.5" />
                    <rect x="1" y="6.5" width="14" height="3" rx="1.5" />
                    <rect x="1" y="11" width="14" height="3" rx="1.5" />
                  </svg>
                )}
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
