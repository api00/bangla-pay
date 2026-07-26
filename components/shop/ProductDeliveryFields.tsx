"use client";

import { useState } from "react";

import {
  DELIVERY_MODES,
  PRODUCT_CATEGORIES,
  getAllowedDeliveryModes,
  getDefaultDeliveryMode,
  type DeliveryMode,
  type ProductCategory,
} from "@/lib/product-catalog";

interface ProductDeliveryFieldsProps {
  defaultCategory?: ProductCategory | null;
  defaultDeliveryMode?: DeliveryMode;
}

export default function ProductDeliveryFields({
  defaultCategory,
  defaultDeliveryMode,
}: ProductDeliveryFieldsProps) {
  const [category, setCategory] = useState<ProductCategory | "">(
    defaultCategory ?? "",
  );
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(
    defaultDeliveryMode ??
      (defaultCategory ? getDefaultDeliveryMode(defaultCategory) : "download"),
  );

  const allowedModes = category ? getAllowedDeliveryModes(category) : [];

  return (
    <fieldset className="space-y-5">
      <legend className="sr-only">Product type and delivery</legend>

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
            value={category}
            onChange={(event) => {
              const nextCategory = event.target.value as ProductCategory;
              setCategory(nextCategory);
              setDeliveryMode(getDefaultDeliveryMode(nextCategory));
            }}
            aria-describedby="category-help"
            className="h-12 w-full appearance-none rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-4 pr-11 text-[16px] font-semibold text-[#0e0f0c] outline-none transition-colors focus-visible:border-[#163300] focus-visible:ring-2 focus-visible:ring-[#9fe870]"
          >
            <option value="" disabled>
              Choose a category
            </option>
            {PRODUCT_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label} — {item.formats}
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
          BanglaPay supports e-books, audio, and design or image packs.
        </p>
      </div>

      <div>
        <p
          id="delivery-label"
          className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745]"
        >
          Buyer access
        </p>
        {category ? (
          <div
            role="radiogroup"
            aria-labelledby="delivery-label"
            className="grid gap-2 sm:grid-cols-2"
          >
            {DELIVERY_MODES.filter((mode) =>
              allowedModes.includes(mode.value),
            ).map((mode) => (
              <label
                key={mode.value}
                className={[
                  "cursor-pointer rounded-2xl border p-4 transition-colors",
                  deliveryMode === mode.value
                    ? "border-[#163300] bg-[#e2f6d5]"
                    : "border-[rgba(14,15,12,0.12)] bg-white hover:border-[rgba(14,15,12,0.28)]",
                ].join(" ")}
              >
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="delivery_mode"
                    value={mode.value}
                    checked={deliveryMode === mode.value}
                    onChange={() => setDeliveryMode(mode.value)}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[#163300] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
                  />
                  <span>
                    <span className="block text-[14px] font-semibold text-[#0e0f0c]">
                      {mode.label}
                    </span>
                    <span className="mt-1 block text-[12px] leading-[1.5] text-[#454745]">
                      {mode.description}
                    </span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-[rgba(14,15,12,0.14)] bg-[#f7f9f5] px-4 py-3 text-[13px] text-[#454745]">
            Choose a category to see its safe delivery options.
          </p>
        )}
      </div>
    </fieldset>
  );
}
