"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  updateProduct,
  type UpdateProductState,
} from "@/app/dashboard/shop/_actions/update-product";
import type { Product } from "@/db/schema";
import { paisaToTaka } from "@/lib/money";

import PricingPicker from "./PricingPicker";
import ProductCategorySelect from "./ProductCategorySelect";

const initial: UpdateProductState = { ok: false };

interface EditProductFormProps {
  product: Product;
}

export default function EditProductForm({ product }: EditProductFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProduct,
    initial,
  );

  const isOk = state.ok && !state.error;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="product_id" value={product.id} />

      <ProductCategorySelect defaultValue={product.category} />

      <div>
        <label
          htmlFor="title"
          className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745] mb-2"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={80}
          required
          defaultValue={product.title}
          className="h-12 w-full rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-4 text-[16px] font-medium text-[#0e0f0c] outline-none transition-colors placeholder:text-[#6b6d6b] focus-visible:border-[#163300] focus-visible:ring-2 focus-visible:ring-[#9fe870]"
        />
      </div>

      <div>
        <label
          htmlFor="subtitle"
          className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745] mb-2"
        >
          Subtitle (optional)
        </label>
        <input
          id="subtitle"
          name="subtitle"
          type="text"
          maxLength={140}
          defaultValue={product.subtitle ?? ""}
          placeholder="A short, punchy line"
          className="h-12 w-full rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-4 text-[16px] font-medium text-[#0e0f0c] outline-none transition-colors placeholder:text-[#6b6d6b] focus-visible:border-[#163300] focus-visible:ring-2 focus-visible:ring-[#9fe870]"
        />
      </div>

      <div>
        <label
          htmlFor="description_md"
          className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745] mb-2"
        >
          Description (Markdown supported)
        </label>
        <textarea
          id="description_md"
          name="description_md"
          rows={8}
          maxLength={4_000}
          defaultValue={product.descriptionMd ?? ""}
          placeholder="What do supporters get? Format, length, why it's worth it."
          className="w-full resize-y rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-4 py-3 text-[16px] leading-[1.6] text-[#0e0f0c] outline-none transition-colors placeholder:text-[#6b6d6b] focus-visible:border-[#163300] focus-visible:ring-2 focus-visible:ring-[#9fe870]"
        />
      </div>

      <PricingPicker
        defaultValue={product.pricingModel}
        defaultBasePrice={
          product.basePricePaisa
            ? String(paisaToTaka(product.basePricePaisa))
            : ""
        }
        defaultMinPrice={
          product.minPricePaisa
            ? String(paisaToTaka(product.minPricePaisa))
            : ""
        }
      />

      <div className="rounded-2xl border border-[rgba(14,15,12,0.1)] bg-[#f7f9f5] p-4">
        <div className="flex items-start gap-3">
          <input
            id="rights_confirmed"
            name="rights_confirmed"
            type="checkbox"
            value="yes"
            defaultChecked={Boolean(product.rightsConfirmedAt)}
            disabled={Boolean(product.rightsConfirmedAt)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#163300] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
          />
          <label
            htmlFor="rights_confirmed"
            className="text-[14px] font-semibold leading-[1.55] text-[#0e0f0c]"
          >
            I confirm that I created this product or have the necessary
            permission or licence to sell and distribute it.
          </label>
        </div>
        <p className="ml-8 mt-2 text-[13px] leading-[1.55] text-[#454745]">
          {product.rightsConfirmedAt
            ? "Rights confirmed. This declaration is required for every published product."
            : "Save this declaration before publishing. Copyright remains with you; buyers receive access, not ownership."}{" "}
          <Link
            href="/copyright"
            target="_blank"
            className="font-semibold text-[#163300] underline decoration-[#9fe870] decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
          >
            Read the copyright policy
          </Link>
          .
        </p>
      </div>

      {state.error && !state.ok && (
        <p
          role="alert"
          className="text-[13px] font-medium text-[#da291c] leading-[1.55]"
        >
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="h-12 px-6 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[15px] inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
        {isOk && !isPending && (
          <span
            role="status"
            className="save-badge text-[13px] font-semibold text-[#163300]"
          >
            ✓ Saved
          </span>
        )}
      </div>
    </form>
  );
}
