"use client";

import type { ProductFile } from "@/db/schema";
import type { DeliveryMode, ProductCategory } from "@/lib/product-catalog";

import FileUploader from "../FileUploader";
import ProductImagesUploader from "../ProductImagesUploader";
import TagsField from "../TagsField";

export interface ContentValues {
  subtitle: string;
  description: string;
  /** Comma-separated; normalised on save. */
  tags: string;
}

interface StepContentProps {
  productId: string;
  category: ProductCategory;
  deliveryMode: DeliveryMode;
  /** Files already attached — a quick-start drop lands here pre-uploaded. */
  files: ProductFile[];
  values: ContentValues;
  /** Tags came from the file read and haven't been edited yet. */
  tagsSuggested: boolean;
  onChange: (patch: Partial<ContentValues>) => void;
}

const labelClass =
  "mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-warm-dark";

export default function StepContent({
  productId,
  category,
  deliveryMode,
  files,
  values,
  tagsSuggested,
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
          files={files}
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
            className="h-12 w-full rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-4 text-[16px] font-medium text-near-black outline-none transition-colors placeholder:text-gray-ink focus-visible:border-dark-green focus-visible:ring-2 focus-visible:ring-wise-green"
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
            className="w-full rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-4 py-3 text-[15px] font-medium leading-[1.6] text-near-black outline-none transition-colors placeholder:text-gray-ink focus-visible:border-dark-green focus-visible:ring-2 focus-visible:ring-wise-green"
          />
          <p className="mt-2 text-right text-[12px] tabular-nums text-gray">
            {values.description.length}/4000
          </p>
        </div>

        <TagsField
          value={values.tags}
          suggested={tagsSuggested}
          onChange={(tags) => onChange({ tags })}
        />
      </section>
    </div>
  );
}
