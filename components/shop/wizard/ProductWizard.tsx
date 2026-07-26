"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  finalizeProduct,
  saveProductBasics,
  saveProductContent,
  type WizardField,
} from "@/app/dashboard/shop/_actions/wizard-steps";
import {
  getDefaultDeliveryMode,
  type DeliveryMode,
  type ProductCategory,
} from "@/lib/product-catalog";

import StepAccess, { type AccessValues } from "./StepAccess";
import StepBasics, { type BasicsValues } from "./StepBasics";
import StepContent, { type ContentValues } from "./StepContent";
import WizardProgress, { type WizardStepMeta } from "./WizardProgress";

const STEPS: readonly WizardStepMeta[] = [
  { id: 1, label: "Basics", hint: "Category, title, price" },
  { id: 2, label: "Content", hint: "Images, files, description" },
  { id: 3, label: "Access", hint: "Delivery and rights" },
];

export default function ProductWizard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState(1);
  const [furthest, setFurthest] = useState(1);
  const [productId, setProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<WizardField | undefined>();

  const [basics, setBasics] = useState<BasicsValues>({
    category: "",
    title: "",
    slug: "",
    slugDirty: false,
    pricing: "fixed",
    basePrice: "",
    minPrice: "",
  });
  const [content, setContent] = useState<ContentValues>({
    subtitle: "",
    description: "",
  });
  const [access, setAccess] = useState<AccessValues>({
    deliveryMode: "",
    rightsConfirmed: false,
  });

  function clearError() {
    setError(null);
    setErrorField(undefined);
  }

  function goTo(next: number) {
    clearError();
    setStep(next);
    setFurthest((prev) => Math.max(prev, next));
  }

  function submitBasics() {
    clearError();
    startTransition(async () => {
      const result = await saveProductBasics({
        productId,
        title: basics.title,
        slug: basics.slug,
        category: basics.category,
        pricingModel: basics.pricing,
        basePrice: basics.basePrice,
        minPrice: basics.minPrice,
      });
      if (!result.ok || !result.productId) {
        setError(result.error ?? "Something went wrong.");
        setErrorField(result.field);
        return;
      }
      setProductId(result.productId);
      // Seed the access step with the category's safe default.
      if (!access.deliveryMode && basics.category) {
        setAccess((prev) => ({
          ...prev,
          deliveryMode: getDefaultDeliveryMode(
            basics.category as ProductCategory,
          ),
        }));
      }
      goTo(2);
    });
  }

  function submitContent() {
    if (!productId) return;
    clearError();
    startTransition(async () => {
      const result = await saveProductContent({
        productId,
        subtitle: content.subtitle,
        description: content.description,
      });
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      goTo(3);
    });
  }

  function submitFinal(publish: boolean) {
    if (!productId) return;
    clearError();
    startTransition(async () => {
      const result = await finalizeProduct({
        productId,
        deliveryMode: access.deliveryMode,
        rightsConfirmed: access.rightsConfirmed,
        publish,
      });
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        setErrorField(result.field);
        return;
      }
      router.push("/dashboard/shop");
    });
  }

  const canContinueBasics =
    Boolean(basics.category) && basics.title.trim().length > 0;

  return (
    <div>
      <WizardProgress
        steps={STEPS}
        current={step}
        furthest={furthest}
        onJump={goTo}
      />

      <div className="rounded-[24px] border border-[rgba(14,15,12,0.06)] bg-white p-6 md:p-7">
        {step === 1 && (
          <StepBasics
            values={basics}
            errorField={errorField}
            onChange={(patch) => {
              clearError();
              setBasics((prev) => ({ ...prev, ...patch }));
            }}
          />
        )}

        {step === 2 && productId && basics.category && (
          <StepContent
            productId={productId}
            category={basics.category as ProductCategory}
            deliveryMode={
              (access.deliveryMode ||
                getDefaultDeliveryMode(
                  basics.category as ProductCategory,
                )) as DeliveryMode
            }
            values={content}
            onChange={(patch) => setContent((prev) => ({ ...prev, ...patch }))}
          />
        )}

        {step === 3 && basics.category && (
          <StepAccess
            category={basics.category as ProductCategory}
            basics={basics}
            values={access}
            errorField={errorField}
            onChange={(patch) => {
              clearError();
              setAccess((prev) => ({ ...prev, ...patch }));
            }}
          />
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-2xl bg-[#fde2df] px-4 py-3 text-[13px] font-medium leading-[1.55] text-[#a3221a]"
          >
            {error}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={isPending}
            className="inline-flex h-12 items-center justify-center rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-5 text-[15px] font-semibold text-[#0e0f0c] transition-colors hover:border-[#0e0f0c] disabled:opacity-60"
          >
            ← Back
          </button>
        )}

        {step === 1 && (
          <button
            type="button"
            onClick={submitBasics}
            disabled={isPending || !canContinueBasics}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#9fe870] px-6 text-[15px] font-semibold text-[#163300] shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {isPending ? "Saving…" : "Continue"}
            {!isPending && <span aria-hidden>→</span>}
          </button>
        )}

        {step === 2 && (
          <button
            type="button"
            onClick={submitContent}
            disabled={isPending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#9fe870] px-6 text-[15px] font-semibold text-[#163300] shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {isPending ? "Saving…" : "Continue"}
            {!isPending && <span aria-hidden>→</span>}
          </button>
        )}

        {step === 3 && (
          <>
            <button
              type="button"
              onClick={() => submitFinal(true)}
              disabled={isPending}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#9fe870] px-6 text-[15px] font-semibold text-[#163300] shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {isPending ? "Publishing…" : "Publish"}
              {!isPending && <span aria-hidden>→</span>}
            </button>
            <button
              type="button"
              onClick={() => submitFinal(false)}
              disabled={isPending}
              className="inline-flex h-12 items-center justify-center rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-5 text-[15px] font-semibold text-[#0e0f0c] transition-colors hover:border-[#0e0f0c] disabled:opacity-60"
            >
              Save as draft
            </button>
          </>
        )}
      </div>

      {step === 2 && (
        <p className="mt-3 text-[12px] text-[#868685]">
          Images and files upload as you add them.
        </p>
      )}
    </div>
  );
}
