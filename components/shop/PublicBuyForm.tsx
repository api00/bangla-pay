"use client";

import Link from "next/link";
import { useActionState, useState, type ChangeEvent } from "react";

import {
  startPurchase,
  type StartPurchaseState,
} from "@/app/[handle]/shop/[slug]/_actions/start-purchase";
import type { Product } from "@/db/schema";
import { formatTaka, paisaToTaka, parseTakaInput } from "@/lib/money";
import { getDeliveryMode } from "@/lib/product-catalog";

interface PublicBuyFormProps {
  handle: string;
  slug: string;
  product: Product;
  themeColor: string;
}

const initial: StartPurchaseState = { ok: false };

export default function PublicBuyForm({
  handle,
  slug,
  product,
  themeColor,
}: PublicBuyFormProps) {
  const [state, formAction, isPending] = useActionState(
    startPurchase,
    initial,
  );

  const showCustom = product.pricingModel === "pay_what_you_want";
  const minPaisa = product.minPricePaisa ?? 0;
  const defaultCustom = String(paisaToTaka(product.basePricePaisa));
  const [customRaw, setCustomRaw] = useState(defaultCustom);
  const [licenseAccepted, setLicenseAccepted] = useState(false);

  const customPaisa = parseTakaInput(customRaw) ?? 0;
  const effectivePaisa = showCustom ? customPaisa : product.basePricePaisa;

  function onCustom(event: ChangeEvent<HTMLInputElement>) {
    setCustomRaw(event.target.value);
  }

  const ctaLabel =
    product.pricingModel === "free"
      ? "Get for free"
      : `Buy for ${formatTaka(effectivePaisa)}`;

  const canSubmit =
    !isPending &&
    licenseAccepted &&
    (product.pricingModel === "free" ||
      (effectivePaisa > 0 && effectivePaisa >= minPaisa));
  const delivery = getDeliveryMode(product.deliveryMode);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="handle" value={handle} />
      <input type="hidden" name="slug" value={slug} />

      {showCustom && (
        <div>
          <label
            htmlFor="custom_amount"
            className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745] mb-2"
          >
            Pay what you want
            {minPaisa > 0 && (
              <span className="ml-2 font-normal text-[#868685]">
                (min {formatTaka(minPaisa)})
              </span>
            )}
          </label>
          <div className="flex items-stretch h-12 rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white focus-within:border-[#0e0f0c] transition-colors overflow-hidden">
            <span className="px-4 inline-flex items-center text-[15px] text-[#868685] bg-[#f7f9f5] border-r border-[rgba(14,15,12,0.08)]">
              ৳
            </span>
            <input
              id="custom_amount"
              type="text"
              inputMode="decimal"
              name="custom_amount"
              value={customRaw}
              onChange={onCustom}
              className="flex-1 px-4 text-[15px] font-semibold text-[#0e0f0c] placeholder:text-[#868685] outline-none"
            />
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="supporter_email"
          className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745] mb-2"
        >
          Email for private access
        </label>
        <input
          id="supporter_email"
          type="email"
          name="supporter_email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full h-12 px-4 rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[15px] font-medium text-[#0e0f0c] placeholder:text-[#868685] outline-none focus:border-[#0e0f0c] transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="supporter_name"
          className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745] mb-2"
        >
          Your name (optional)
        </label>
        <input
          id="supporter_name"
          type="text"
          name="supporter_name"
          maxLength={60}
          className="w-full h-12 px-4 rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[15px] font-medium text-[#0e0f0c] placeholder:text-[#868685] outline-none focus:border-[#0e0f0c] transition-colors"
        />
      </div>

      <div className="rounded-2xl border border-[rgba(14,15,12,0.1)] bg-[#f7f9f5] p-4">
        <div className="flex items-start gap-3">
          <input
            id="license_accepted"
            name="license_accepted"
            type="checkbox"
            value="yes"
            required
            checked={licenseAccepted}
            onChange={(event) => setLicenseAccepted(event.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#163300] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
          />
          <label
            htmlFor="license_accepted"
            className="text-[13px] font-semibold leading-[1.55] text-[#0e0f0c]"
          >
            I accept the personal-use licence and will not copy, resell, or
            share this product.
          </label>
        </div>
        <p className="ml-8 mt-2 text-[12px] leading-[1.5] text-[#454745]">
          Access is tied to your email and order code.{" "}
          <Link
            href="/copyright"
            target="_blank"
            className="font-semibold text-[#163300] underline decoration-[#9fe870] decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
          >
            Read the policy
          </Link>
          .
        </p>
      </div>

      {state.error && (
        <p
          role="alert"
          className="text-[13px] font-medium text-[#da291c] leading-[1.55]"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full h-12 rounded-full font-semibold text-[15px] text-[#163300] inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_1px_0_0_rgba(22,51,0,0.18),0_10px_30px_-14px_rgba(159,232,112,0.7)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{ backgroundColor: themeColor }}
      >
        {isPending ? "Preparing checkout…" : ctaLabel}
        {!isPending && <span aria-hidden>→</span>}
      </button>
      <p className="text-center text-[12px] leading-[1.5] text-[#454745]">
        After purchase:{" "}
        <span className="font-semibold text-[#0e0f0c]">{delivery.label}</span>{" "}
        from your private library.
      </p>
    </form>
  );
}
