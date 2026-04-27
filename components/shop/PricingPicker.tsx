"use client";

import { useState, type ChangeEvent } from "react";

const OPTIONS: { value: "fixed" | "pay_what_you_want" | "free"; title: string; sub: string }[] = [
  {
    value: "fixed",
    title: "Fixed price",
    sub: "Set a single amount. Most products use this.",
  },
  {
    value: "pay_what_you_want",
    title: "Pay what you want",
    sub: "Suggest a price; supporters can pay more.",
  },
  {
    value: "free",
    title: "Free",
    sub: "No payment — collect emails and fans.",
  },
];

interface PricingPickerProps {
  defaultValue: "fixed" | "pay_what_you_want" | "free";
  defaultBasePrice: string;
  defaultMinPrice: string;
}

export default function PricingPicker({
  defaultValue,
  defaultBasePrice,
  defaultMinPrice,
}: PricingPickerProps) {
  const [model, setModel] = useState(defaultValue);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    setModel(event.target.value as typeof model);
  }

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Pricing model" className="grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((opt) => {
          const checked = opt.value === model;
          return (
            <label
              key={opt.value}
              className={[
                "flex flex-col gap-1 rounded-2xl border-[1.5px] px-4 py-4 cursor-pointer transition-colors",
                checked
                  ? "border-[#0e0f0c] bg-[#f7f9f5]"
                  : "border-[rgba(14,15,12,0.10)] bg-white hover:border-[#454745]",
              ].join(" ")}
            >
              <input
                type="radio"
                name="pricing_model"
                value={opt.value}
                checked={checked}
                onChange={onChange}
                className="sr-only"
              />
              <span className="text-[14px] font-semibold text-[#0e0f0c]">
                {opt.title}
              </span>
              <span className="text-[12px] text-[#454745] leading-[1.5]">
                {opt.sub}
              </span>
            </label>
          );
        })}
      </div>

      {model !== "free" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="base_price"
              className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745] mb-2"
            >
              {model === "pay_what_you_want" ? "Suggested price" : "Price"}
            </label>
            <div className="flex items-stretch h-12 rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white focus-within:border-[#0e0f0c] transition-colors overflow-hidden">
              <span className="px-4 inline-flex items-center text-[15px] text-[#868685] bg-[#f7f9f5] border-r border-[rgba(14,15,12,0.08)]">
                ৳
              </span>
              <input
                id="base_price"
                type="text"
                inputMode="decimal"
                name="base_price"
                defaultValue={defaultBasePrice}
                placeholder="500"
                required
                className="flex-1 px-4 text-[15px] font-semibold text-[#0e0f0c] placeholder:text-[#868685] outline-none"
              />
            </div>
          </div>

          {model === "pay_what_you_want" && (
            <div>
              <label
                htmlFor="min_price"
                className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745] mb-2"
              >
                Minimum (optional)
              </label>
              <div className="flex items-stretch h-12 rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white focus-within:border-[#0e0f0c] transition-colors overflow-hidden">
                <span className="px-4 inline-flex items-center text-[15px] text-[#868685] bg-[#f7f9f5] border-r border-[rgba(14,15,12,0.08)]">
                  ৳
                </span>
                <input
                  id="min_price"
                  type="text"
                  inputMode="decimal"
                  name="min_price"
                  defaultValue={defaultMinPrice}
                  placeholder="100"
                  className="flex-1 px-4 text-[15px] font-semibold text-[#0e0f0c] placeholder:text-[#868685] outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
