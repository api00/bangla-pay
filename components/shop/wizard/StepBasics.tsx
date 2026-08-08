"use client";

import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/product-catalog";
import { slugify } from "@/lib/slug";

import type { WizardField } from "@/app/dashboard/shop/_actions/wizard-steps";

import QuickStartDropzone, { type QuickStartResult } from "./QuickStartDropzone";

export type PricingModel = "fixed" | "pay_what_you_want" | "free";

/** Fields the quick-start drop can fill in on the creator's behalf. */
export type AutofilledField = "category" | "title" | "slug";

export interface BasicsValues {
  category: ProductCategory | "";
  title: string;
  slug: string;
  slugDirty: boolean;
  pricing: PricingModel;
  basePrice: string;
  minPrice: string;
}

interface StepBasicsProps {
  values: BasicsValues;
  errorField?: WizardField;
  onChange: (patch: Partial<BasicsValues>) => void;
  /** Null until a draft exists — the dropzone shows only before that. */
  productId: string | null;
  /** Filename the current values were derived from, when there was one. */
  quickStartFilename: string | null;
  autofilled: readonly AutofilledField[];
  /** The file's contents are still being read for a better title/description. */
  reading: boolean;
  onQuickStart: (result: QuickStartResult) => void;
}

const PRICING_OPTIONS: { value: PricingModel; title: string; sub: string }[] = [
  {
    value: "fixed",
    title: "Fixed price",
    sub: "One set amount. Most products use this.",
  },
  {
    value: "pay_what_you_want",
    title: "Pay what you want",
    sub: "Suggest a price; supporters can pay more.",
  },
  { value: "free", title: "Free", sub: "No payment — collect emails and fans." },
];

const inputBase =
  "h-12 w-full rounded-2xl border-[1.5px] bg-white px-4 text-[16px] font-medium text-near-black outline-none transition-colors placeholder:text-gray-ink focus-visible:border-dark-green focus-visible:ring-2 focus-visible:ring-wise-green";

function borderFor(invalid: boolean): string {
  return invalid ? "border-heritage-red" : "border-[rgba(14,15,12,0.14)]";
}

const labelClass =
  "mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-warm-dark";

const labelRowClass = "mb-2 flex flex-wrap items-center gap-2";
const labelInlineClass =
  "text-[12px] font-semibold uppercase tracking-[0.18em] text-warm-dark";

/**
 * Marks a value the creator did not type. Deliberately quiet — this is a note,
 * not a status, and it disappears the moment they edit the field.
 */
function FromFileTag() {
  return (
    <span className="inline-flex items-center rounded-pill bg-mint-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-warm-dark">
      From your file
    </span>
  );
}

export default function StepBasics({
  values,
  errorField,
  onChange,
  productId,
  quickStartFilename,
  autofilled,
  reading,
  onQuickStart,
}: StepBasicsProps) {
  const filled = (field: AutofilledField) => autofilled.includes(field);

  return (
    <div className="space-y-6">
      {!productId && (
        <QuickStartDropzone onReady={onQuickStart} />
      )}

      {quickStartFilename && (
        <p
          role="status"
          className="rounded-card bg-mint-surface px-4 py-3 text-[13px] leading-[1.55] text-warm-dark"
        >
          {reading ? (
            <>
              Reading{" "}
              <span className="font-semibold text-near-black">
                {quickStartFilename}
              </span>
              … you can keep typing; anything you change is kept.
            </>
          ) : (
            <>
              Filled in from{" "}
              <span className="font-semibold text-near-black">
                {quickStartFilename}
              </span>
              . Check everything below and change anything that looks wrong.
            </>
          )}
        </p>
      )}

      <div>
        <div className={labelRowClass}>
          <label htmlFor="category" className={labelInlineClass}>
            Product category
          </label>
          {filled("category") && <FromFileTag />}
        </div>
        <div className="relative">
          <select
            id="category"
            value={values.category}
            onChange={(event) =>
              onChange({ category: event.target.value as ProductCategory })
            }
            aria-describedby="category-help"
            className={`${inputBase} ${borderFor(errorField === "category")} appearance-none pr-11 font-semibold`}
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
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-warm-dark"
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
        <p id="category-help" className="mt-2 text-[13px] text-warm-dark">
          This decides which file types you can sell and how buyers open them.
        </p>
      </div>

      <div>
        <div className={labelRowClass}>
          <label htmlFor="title" className={labelInlineClass}>
            Title
          </label>
          {filled("title") && <FromFileTag />}
        </div>
        <input
          id="title"
          type="text"
          maxLength={80}
          value={values.title}
          onChange={(event) => {
            const title = event.target.value;
            onChange(
              values.slugDirty
                ? { title }
                : { title, slug: slugify(title) },
            );
          }}
          placeholder="Monsoon Stories — vol. 2"
          className={`${inputBase} ${borderFor(errorField === "title")}`}
        />
      </div>

      <div>
        <div className={labelRowClass}>
          <label htmlFor="slug" className={labelInlineClass}>
            Link
          </label>
          {filled("slug") && <FromFileTag />}
        </div>
        <div
          className={`flex h-12 items-stretch overflow-hidden rounded-2xl border-[1.5px] bg-white transition-colors focus-within:border-dark-green focus-within:ring-2 focus-within:ring-wise-green ${borderFor(errorField === "slug")}`}
        >
          <span className="inline-flex items-center whitespace-nowrap border-r border-[rgba(14,15,12,0.08)] bg-off-white px-4 text-[14px] text-warm-dark">
            /shop/
          </span>
          <input
            id="slug"
            type="text"
            value={values.slug}
            onChange={(event) =>
              onChange({ slug: event.target.value, slugDirty: true })
            }
            placeholder="monsoon-stories"
            className="min-w-0 flex-1 px-4 text-[16px] font-semibold text-near-black outline-none placeholder:text-gray-ink"
          />
        </div>
        <p className="mt-2 text-[13px] text-warm-dark">
          Lowercase and hyphenated. Changing it later breaks old links.
        </p>
      </div>

      <div>
        <p className={labelClass}>Pricing</p>
        <div
          role="radiogroup"
          aria-label="Pricing model"
          className="grid gap-3 sm:grid-cols-3"
        >
          {PRICING_OPTIONS.map((opt) => {
            const checked = opt.value === values.pricing;
            return (
              <label
                key={opt.value}
                className={[
                  "flex cursor-pointer flex-col gap-1 rounded-2xl border-[1.5px] px-4 py-4 transition-colors focus-within:ring-2 focus-within:ring-wise-green",
                  checked
                    ? "border-near-black bg-off-white"
                    : "border-[rgba(14,15,12,0.10)] bg-white hover:border-warm-dark",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="pricing_model"
                  value={opt.value}
                  checked={checked}
                  onChange={() => onChange({ pricing: opt.value })}
                  className="sr-only"
                />
                <span className="text-[14px] font-semibold text-near-black">
                  {opt.title}
                </span>
                <span className="text-[12px] leading-[1.5] text-warm-dark">
                  {opt.sub}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {values.pricing !== "free" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="base_price" className={labelClass}>
              {values.pricing === "pay_what_you_want"
                ? "Suggested price"
                : "Price"}
            </label>
            <div
              className={`flex h-12 items-stretch overflow-hidden rounded-2xl border-[1.5px] bg-white transition-colors focus-within:border-dark-green focus-within:ring-2 focus-within:ring-wise-green ${borderFor(errorField === "price")}`}
            >
              <span className="inline-flex items-center border-r border-[rgba(14,15,12,0.08)] bg-off-white px-4 text-[15px] text-warm-dark">
                ৳
              </span>
              <input
                id="base_price"
                type="text"
                inputMode="decimal"
                value={values.basePrice}
                onChange={(event) => onChange({ basePrice: event.target.value })}
                placeholder="500"
                className="min-w-0 flex-1 px-4 text-[16px] font-semibold text-near-black outline-none placeholder:text-gray-ink"
              />
            </div>
          </div>

          {values.pricing === "pay_what_you_want" && (
            <div>
              <label htmlFor="min_price" className={labelClass}>
                Minimum (optional)
              </label>
              <div className="flex h-12 items-stretch overflow-hidden rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white transition-colors focus-within:border-dark-green focus-within:ring-2 focus-within:ring-wise-green">
                <span className="inline-flex items-center border-r border-[rgba(14,15,12,0.08)] bg-off-white px-4 text-[15px] text-warm-dark">
                  ৳
                </span>
                <input
                  id="min_price"
                  type="text"
                  inputMode="decimal"
                  value={values.minPrice}
                  onChange={(event) =>
                    onChange({ minPrice: event.target.value })
                  }
                  placeholder="100"
                  className="min-w-0 flex-1 px-4 text-[16px] font-semibold text-near-black outline-none placeholder:text-gray-ink"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
