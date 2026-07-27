"use client";

import Link from "next/link";

import {
  DELIVERY_MODES,
  getAllowedDeliveryModes,
  getProductCategoryLabel,
  type DeliveryMode,
  type ProductCategory,
} from "@/lib/product-catalog";
import { formatTaka } from "@/lib/money";

import type { WizardField } from "@/app/dashboard/shop/_actions/wizard-steps";
import type { BasicsValues } from "./StepBasics";

export interface AccessValues {
  deliveryMode: DeliveryMode | "";
  rightsConfirmed: boolean;
}

interface StepAccessProps {
  category: ProductCategory;
  basics: BasicsValues;
  values: AccessValues;
  errorField?: WizardField;
  onChange: (patch: Partial<AccessValues>) => void;
}

const labelClass =
  "mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-warm-dark";

function priceLabel(basics: BasicsValues): string {
  if (basics.pricing === "free") return "Free";
  const paisa = Math.round(Number(basics.basePrice.replace(/[^\d.]/g, "")) * 100);
  if (!Number.isFinite(paisa) || paisa <= 0) return "—";
  return basics.pricing === "pay_what_you_want"
    ? `${formatTaka(paisa)}+`
    : formatTaka(paisa);
}

export default function StepAccess({
  category,
  basics,
  values,
  errorField,
  onChange,
}: StepAccessProps) {
  const allowed = getAllowedDeliveryModes(category);

  return (
    <div className="space-y-7">
      <section>
        <p className={labelClass}>How supporters get it</p>
        <div
          role="radiogroup"
          aria-label="Buyer access"
          className={[
            "grid gap-2 sm:grid-cols-2",
            errorField === "access"
              ? "rounded-2xl ring-2 ring-heritage-red ring-offset-4"
              : "",
          ].join(" ")}
        >
          {DELIVERY_MODES.filter((mode) => allowed.includes(mode.value)).map(
            (mode) => {
              const checked = values.deliveryMode === mode.value;
              return (
                <label
                  key={mode.value}
                  className={[
                    "cursor-pointer rounded-2xl border p-4 transition-colors",
                    checked
                      ? "border-dark-green bg-light-mint"
                      : "border-[rgba(14,15,12,0.12)] bg-white hover:border-[rgba(14,15,12,0.28)]",
                  ].join(" ")}
                >
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="delivery_mode"
                      value={mode.value}
                      checked={checked}
                      onChange={() => onChange({ deliveryMode: mode.value })}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-dark-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green"
                    />
                    <span>
                      <span className="block text-[14px] font-semibold text-near-black">
                        {mode.label}
                      </span>
                      <span className="mt-1 block text-[12px] leading-[1.5] text-warm-dark">
                        {mode.description}
                      </span>
                    </span>
                  </span>
                </label>
              );
            },
          )}
        </div>
      </section>

      <section>
        <p className={labelClass}>Your rights</p>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[rgba(14,15,12,0.12)] bg-white p-4 transition-colors hover:border-[rgba(14,15,12,0.28)]">
          <input
            type="checkbox"
            checked={values.rightsConfirmed}
            onChange={(event) =>
              onChange({ rightsConfirmed: event.target.checked })
            }
            className="mt-0.5 h-5 w-5 shrink-0 accent-dark-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green"
          />
          <span className="text-[13px] leading-[1.55] text-warm-dark">
            <span className="font-semibold text-near-black">
              I made this, or I have permission to sell it.
            </span>{" "}
            Selling work you don&rsquo;t own can get your page removed.{" "}
            <Link
              href="/copyright"
              target="_blank"
              className="font-semibold text-dark-green underline decoration-wise-green decoration-2 underline-offset-4"
            >
              Details
            </Link>
          </span>
        </label>
      </section>

      <section className="rounded-[20px] border border-[rgba(14,15,12,0.08)] bg-off-white p-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gray">
          Summary
        </p>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-gray">Title</dt>
            <dd className="truncate font-semibold text-near-black">
              {basics.title || "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-gray">Category</dt>
            <dd className="font-semibold text-near-black">
              {getProductCategoryLabel(category)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-gray">Price</dt>
            <dd className="font-semibold tabular-nums text-near-black">
              {priceLabel(basics)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-gray">Link</dt>
            <dd className="truncate font-semibold text-near-black">
              /shop/{basics.slug || "—"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
