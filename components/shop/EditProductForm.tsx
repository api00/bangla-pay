"use client";

import { useActionState, useState } from "react";

import {
  updateProduct,
  type UpdateProductState,
} from "@/app/dashboard/shop/_actions/update-product";
import type { Product } from "@/db/schema";
import { paisaToTaka } from "@/lib/money";

import PricingPicker from "./PricingPicker";

const initial: UpdateProductState = { ok: false };

interface EditProductFormProps {
  product: Product;
}

export default function EditProductForm({ product }: EditProductFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProduct,
    initial,
  );
  const [savedHint, setSavedHint] = useState(false);

  const isOk = state.ok && !state.error;

  if (isOk && !savedHint) setSavedHint(true);

  return (
    <form
      action={formAction}
      className="space-y-6"
      onSubmit={() => setSavedHint(false)}
    >
      <input type="hidden" name="product_id" value={product.id} />

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
          className="w-full h-12 px-4 rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[15px] font-medium text-[#0e0f0c] placeholder:text-[#868685] outline-none focus:border-[#0e0f0c] transition-colors"
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
          className="w-full h-12 px-4 rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[15px] font-medium text-[#0e0f0c] placeholder:text-[#868685] outline-none focus:border-[#0e0f0c] transition-colors"
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
          className="w-full px-4 py-3 rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[14px] text-[#0e0f0c] placeholder:text-[#868685] outline-none focus:border-[#0e0f0c] transition-colors resize-y leading-[1.6]"
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
        {savedHint && (
          <span className="text-[13px] font-semibold text-[#163300]">
            ✓ Saved
          </span>
        )}
      </div>
    </form>
  );
}
