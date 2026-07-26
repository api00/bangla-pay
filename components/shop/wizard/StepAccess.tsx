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
  "mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745]";

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
              ? "rounded-2xl ring-2 ring-[#da291c] ring-offset-4"
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
                      ? "border-[#163300] bg-[#e2f6d5]"
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
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#163300] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
          />
          <span className="text-[13px] leading-[1.55] text-[#454745]">
            <span className="font-semibold text-[#0e0f0c]">
              I made this, or I have permission to sell it.
            </span>{" "}
            Selling work you don&rsquo;t own can get your page removed.{" "}
            <Link
              href="/copyright"
              target="_blank"
              className="font-semibold text-[#163300] underline decoration-[#9fe870] decoration-2 underline-offset-4"
            >
              Details
            </Link>
          </span>
        </label>
      </section>

      <section className="rounded-[20px] border border-[rgba(14,15,12,0.08)] bg-[#f7f9f5] p-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#868685]">
          Summary
        </p>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-[#868685]">Title</dt>
            <dd className="truncate font-semibold text-[#0e0f0c]">
              {basics.title || "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-[#868685]">Category</dt>
            <dd className="font-semibold text-[#0e0f0c]">
              {getProductCategoryLabel(category)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-[#868685]">Price</dt>
            <dd className="font-semibold tabular-nums text-[#0e0f0c]">
              {priceLabel(basics)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-[#868685]">Link</dt>
            <dd className="truncate font-semibold text-[#0e0f0c]">
              /shop/{basics.slug || "—"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
