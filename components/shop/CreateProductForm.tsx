"use client";

import { useActionState, useState } from "react";

import {
  createProduct,
  type CreateProductState,
} from "@/app/dashboard/shop/_actions/create-product";
import { slugify } from "@/lib/slug";

import PricingPicker from "./PricingPicker";
import ProductDeliveryFields from "./ProductDeliveryFields";

const initial: CreateProductState = { ok: false };

export default function CreateProductForm() {
  const [state, formAction, isPending] = useActionState(
    createProduct,
    initial,
  );
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugDirty, setSlugDirty] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      <ProductDeliveryFields />

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
          value={title}
          onChange={(event) => {
            const nextTitle = event.target.value;
            setTitle(nextTitle);
            if (!slugDirty) setSlug(slugify(nextTitle));
          }}
          placeholder="Monsoon Stories — vol. 2"
          className="h-12 w-full rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-4 text-[16px] font-medium text-[#0e0f0c] outline-none transition-colors placeholder:text-[#6b6d6b] focus-visible:border-[#163300] focus-visible:ring-2 focus-visible:ring-[#9fe870]"
        />
      </div>

      <div>
        <label
          htmlFor="slug"
          className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745] mb-2"
        >
          Slug
        </label>
        <div className="flex h-12 items-stretch overflow-hidden rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white transition-colors focus-within:border-[#163300] focus-within:ring-2 focus-within:ring-[#9fe870]">
          <span className="inline-flex items-center whitespace-nowrap border-r border-[rgba(14,15,12,0.08)] bg-[#f7f9f5] px-4 text-[14px] text-[#454745]">
            /shop/
          </span>
          <input
            id="slug"
            name="slug"
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugDirty(true);
            }}
            placeholder="monsoon-stories"
            className="min-w-0 flex-1 px-4 text-[16px] font-semibold text-[#0e0f0c] outline-none placeholder:text-[#6b6d6b]"
          />
        </div>
        <p className="mt-2 text-[13px] leading-[1.5] text-[#454745]">
          Lowercase, hyphenated. You can change this later, but old links break.
        </p>
      </div>

      <PricingPicker
        defaultValue="fixed"
        defaultBasePrice=""
        defaultMinPrice=""
      />

      {state.error && (
        <p
          role="alert"
          className="text-[13px] font-medium text-[#da291c] leading-[1.55]"
        >
          {state.error}
        </p>
      )}

      <div className="rounded-2xl bg-[#f7f9f5] border border-[rgba(14,15,12,0.06)] px-4 py-3 flex gap-3 items-start">
        <span
          aria-hidden
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#9fe870] text-[#163300]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M12 2c.45 5.45 1.36 6.36 9 9-7.64 2.64-8.55 3.55-9 9-.45-5.45-1.36-6.36-9-9 7.64-2.64 8.55-3.55 9-9Z" />
          </svg>
        </span>
        <p className="text-[13px] text-[#454745] leading-[1.55]">
          <strong className="text-[#0e0f0c]">Next step:</strong> upload images
          (up to 8), add the files supporters receive, describe the product,
          choose buyer access, and confirm that you have the right to sell it.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="h-12 px-6 rounded-full bg-[#9fe870] text-[#163300] font-semibold text-[15px] inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isPending ? "Creating…" : "Create & add images"}
          {!isPending && <span aria-hidden>→</span>}
        </button>
      </div>
    </form>
  );
}
