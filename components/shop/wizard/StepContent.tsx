"use client";

import type { DeliveryMode, ProductCategory } from "@/lib/product-catalog";

import FileUploader from "../FileUploader";
import ProductImagesUploader from "../ProductImagesUploader";

export interface ContentValues {
  subtitle: string;
  description: string;
}

interface StepContentProps {
  productId: string;
  category: ProductCategory;
  deliveryMode: DeliveryMode;
  values: ContentValues;
  onChange: (patch: Partial<ContentValues>) => void;
}

const labelClass =
  "mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745]";

export default function StepContent({
  productId,
  category,
  deliveryMode,
  values,
  onChange,
}: StepContentProps) {
  return (
    <div className="space-y-8">
      <section>
        <ProductImagesUploader productId={productId} initialUrls={[]} />
      </section>

      <hr className="border-[rgba(14,15,12,0.06)]" />

      <section>
        <FileUploader
          productId={productId}
          files={[]}
          productCategory={category}
          deliveryMode={deliveryMode}
        />
      </section>

      <hr className="border-[rgba(14,15,12,0.06)]" />

      <section className="space-y-5">
        <div>
          <label htmlFor="subtitle" className={labelClass}>
            Short tagline (optional)
          </label>
          <input
            id="subtitle"
            type="text"
            maxLength={140}
            value={values.subtitle}
            onChange={(event) => onChange({ subtitle: event.target.value })}
            placeholder="A sample PDF e-book for checkout testing"
            className="h-12 w-full rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-4 text-[16px] font-medium text-[#0e0f0c] outline-none transition-colors placeholder:text-[#6b6d6b] focus-visible:border-[#163300] focus-visible:ring-2 focus-visible:ring-[#9fe870]"
          />
        </div>

        <div>
          <label htmlFor="description_md" className={labelClass}>
            Description (optional)
          </label>
          <textarea
            id="description_md"
            rows={6}
            maxLength={4000}
            value={values.description}
            onChange={(event) => onChange({ description: event.target.value })}
            placeholder="What supporters get, who it's for, and anything they should know before buying."
            className="w-full rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-4 py-3 text-[15px] font-medium leading-[1.6] text-[#0e0f0c] outline-none transition-colors placeholder:text-[#6b6d6b] focus-visible:border-[#163300] focus-visible:ring-2 focus-visible:ring-[#9fe870]"
          />
          <p className="mt-2 text-right text-[12px] tabular-nums text-[#868685]">
            {values.description.length}/4000
          </p>
        </div>
      </section>
    </div>
  );
}
