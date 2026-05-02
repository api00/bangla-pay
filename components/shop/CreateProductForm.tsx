"use client";

import { useActionState, useEffect, useState } from "react";

import {
  createProduct,
  type CreateProductState,
} from "@/app/dashboard/shop/_actions/create-product";
import { slugify } from "@/lib/slug";

import PricingPicker from "./PricingPicker";

const initial: CreateProductState = { ok: false };

export default function CreateProductForm() {
  const [state, formAction, isPending] = useActionState(
    createProduct,
    initial,
  );
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugDirty, setSlugDirty] = useState(false);

  useEffect(() => {
    if (!slugDirty) {
      setSlug(slugify(title));
    }
  }, [title, slugDirty]);

  return (
    <form action={formAction} className="space-y-6">
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
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Monsoon Stories — vol. 2"
          className="w-full h-12 px-4 rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[15px] font-medium text-[#0e0f0c] placeholder:text-[#868685] outline-none focus:border-[#0e0f0c] transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="slug"
          className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745] mb-2"
        >
          Slug
        </label>
        <div className="flex items-stretch h-12 rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white focus-within:border-[#0e0f0c] transition-colors overflow-hidden">
          <span className="px-4 inline-flex items-center text-[14px] text-[#868685] bg-[#f7f9f5] border-r border-[rgba(14,15,12,0.08)] whitespace-nowrap">
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
            className="flex-1 px-4 text-[15px] font-semibold text-[#0e0f0c] placeholder:text-[#868685] outline-none"
          />
        </div>
        <p className="mt-2 text-[12px] text-[#868685] leading-[1.5]">
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
          className="w-6 h-6 shrink-0 rounded-full bg-[#9fe870] text-[#163300] inline-flex items-center justify-center text-[13px] font-bold"
        >
          ★
        </span>
        <p className="text-[13px] text-[#454745] leading-[1.55]">
          <strong className="text-[#0e0f0c]">Next step:</strong> upload images
          (up to 8), add files supporters get when they buy, and write a
          description. The first image becomes the cover.
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
