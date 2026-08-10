"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import {
  analyzeProductUpload,
  type AnalysisSkipReason,
} from "@/app/dashboard/shop/_actions/analyze-upload";
import { formatTagsInput } from "@/lib/product-tags";
import { slugify } from "@/lib/slug";

import {
  finalizeProduct,
  saveProductBasics,
  saveProductContent,
  type WizardField,
} from "@/app/dashboard/shop/_actions/wizard-steps";
import type { ProductFile } from "@/db/schema";
import {
  getDefaultDeliveryMode,
  type DeliveryMode,
  type ProductCategory,
} from "@/lib/product-catalog";

import type { QuickStartResult } from "./QuickStartDropzone";
import StepAccess, { type AccessValues } from "./StepAccess";
import StepBasics, {
  type AutofilledField,
  type BasicsValues,
} from "./StepBasics";
import StepContent, { type ContentValues } from "./StepContent";
import UploadAnalysisStatus, {
  type UploadAnalysisFeedback,
} from "./UploadAnalysisStatus";
import WizardProgress, { type WizardStepMeta } from "./WizardProgress";

const STEPS: readonly WizardStepMeta[] = [
  { id: 1, label: "Basics", hint: "Category, title, price" },
  { id: 2, label: "Content", hint: "Images, files, description" },
  { id: 3, label: "Access", hint: "Delivery and rights" },
];

function skippedFeedback(reason: AnalysisSkipReason): Pick<
  UploadAnalysisFeedback,
  "kind" | "message" | "retryable"
> {
  switch (reason) {
    case "disabled":
      return {
        kind: "notice",
        message:
          "Automatic writing is unavailable in this environment. You can continue manually.",
      };
    case "unsupported":
      return {
        kind: "notice",
        message:
          "This format cannot be read automatically. Use a PDF, image, MCPB, README, config, or source file within the shown size limit.",
      };
    case "rate_limited":
      return {
        kind: "notice",
        message:
          "The automatic-writing limit was reached. Try again in an hour or continue manually.",
      };
    case "unreadable":
      return {
        kind: "notice",
        message:
          "We could not find enough readable content to draft the listing. Check the file or continue manually.",
        retryable: true,
      };
  }
}

export default function ProductWizard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState(1);
  const [furthest, setFurthest] = useState(1);
  const [productId, setProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<WizardField | undefined>();

  // Quick start: a dropped file can create the draft and fill step 1 before
  // the creator types anything. Both are empty on the manual path.
  const [uploadedFiles, setUploadedFiles] = useState<ProductFile[]>([]);
  const [autofilled, setAutofilled] = useState<readonly AutofilledField[]>([]);
  const [analysis, setAnalysis] = useState<UploadAnalysisFeedback | null>(null);
  const analysisRequestRef = useRef(0);
  /**
   * Set once the creator types their own title. The file read can land
   * seconds after the drop, and it must never overwrite what they wrote.
   */
  const titleEditedRef = useRef(false);
  /** Same guard for tags: the creator's own list is never overwritten. */
  const tagsEditedRef = useRef(false);

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
    tags: "",
  });
  const [tagsSuggested, setTagsSuggested] = useState(false);
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

  /**
   * A quick-start drop has created the draft and uploaded the file. Seed the
   * fields it could derive; the creator reviews them like any other value.
   */
  function handleQuickStart(result: QuickStartResult) {
    clearError();
    setProductId(result.productId);
    setBasics((prev) => ({
      ...prev,
      category: result.category,
      title: result.title,
      slug: result.slug,
      slugDirty: false,
    }));
    setAccess((prev) => ({ ...prev, deliveryMode: result.deliveryMode }));
    setUploadedFiles((prev) => [...prev, result.file]);
    setAutofilled(["category", "title", "slug"]);
    titleEditedRef.current = false;
    void readFile(result.productId, result.file);
  }

  /**
   * Second pass: read the file's contents for a better title and a
   * description. Deliberately not awaited by the drop — the fields are already
   * usable, and the creator can start editing or continue while this lands.
   */
  async function readFile(nextProductId: string, file: ProductFile) {
    const requestId = analysisRequestRef.current + 1;
    analysisRequestRef.current = requestId;
    setAnalysis({
      kind: "reading",
      filename: file.filename,
      fileId: file.id,
      message:
        "Reading the file and drafting your listing. You can keep editing while this runs.",
    });

    try {
      const result = await analyzeProductUpload({
        productId: nextProductId,
        fileId: file.id,
      });
      if (requestId !== analysisRequestRef.current) return;

      if (!result.ok || !result.suggestion) {
        if (result.skipped) {
          setAnalysis({
            ...skippedFeedback(result.skipped),
            filename: file.filename,
            fileId: file.id,
          });
          return;
        }
        setAnalysis({
          kind: "error",
          filename: file.filename,
          fileId: file.id,
          message:
            result.error ??
            "Automatic writing failed. Try again or continue manually.",
          retryable: true,
        });
        return;
      }

      const { title, subtitle, description, tags } = result.suggestion;

      // Only fill what the creator hasn't written themselves. Anything they
      // typed while this was in flight wins.
      if (!titleEditedRef.current && title) {
        setBasics((prev) => ({
          ...prev,
          title,
          slug: prev.slugDirty ? prev.slug : slugify(title),
        }));
        setAutofilled((prev) =>
          prev.includes("title") ? prev : [...prev, "title"],
        );
      }

      setContent((prev) => ({
        subtitle: prev.subtitle || subtitle,
        description: prev.description || description,
        tags: tagsEditedRef.current ? prev.tags : formatTagsInput(tags),
      }));
      if (!tagsEditedRef.current && tags.length > 0) setTagsSuggested(true);
      setAnalysis({
        kind: "success",
        filename: file.filename,
        fileId: file.id,
        message:
          "AI drafted the title, tagline, description, and search tags. Review and edit anything you want.",
      });
    } catch {
      if (requestId !== analysisRequestRef.current) return;
      setAnalysis({
        kind: "error",
        filename: file.filename,
        fileId: file.id,
        message: "Automatic writing failed. Try again or continue manually.",
        retryable: true,
      });
    }
  }

  function handleContentFileAdded(file: ProductFile) {
    setUploadedFiles((prev) =>
      prev.some((existing) => existing.id === file.id) ? prev : [...prev, file],
    );
    if (productId) void readFile(productId, file);
  }

  function retryAnalysis() {
    if (!productId || !analysis) return;
    const file = uploadedFiles.find((item) => item.id === analysis.fileId);
    if (file) void readFile(productId, file);
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
        tags: content.tags,
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
  const isReading = analysis?.kind === "reading";

  return (
    <div>
      <WizardProgress
        steps={STEPS}
        current={step}
        furthest={furthest}
        onJump={goTo}
      />

      <div className="rounded-[24px] border border-[rgba(14,15,12,0.06)] bg-white p-6 md:p-7">
        {analysis && (
          <UploadAnalysisStatus
            feedback={analysis}
            onRetry={retryAnalysis}
          />
        )}

        {step === 1 && (
          <StepBasics
            values={basics}
            errorField={errorField}
            productId={productId}
            autofilled={autofilled}
            onQuickStart={handleQuickStart}
            onChange={(patch) => {
              clearError();
              if (patch.title !== undefined) titleEditedRef.current = true;
              setBasics((prev) => ({ ...prev, ...patch }));
              // Editing a field makes it the creator's own — drop the marker.
              setAutofilled((prev) =>
                prev.filter((field) => !(field in patch)),
              );
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
            files={uploadedFiles}
            values={content}
            tagsSuggested={tagsSuggested}
            onFileAdded={handleContentFileAdded}
            onChange={(patch) => {
              if (patch.tags !== undefined) {
                tagsEditedRef.current = true;
                setTagsSuggested(false);
              }
              setContent((prev) => ({ ...prev, ...patch }));
            }}
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
            className="mt-5 rounded-2xl bg-danger-surface px-4 py-3 text-[13px] font-medium leading-[1.55] text-heritage-red-ink"
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
            className="inline-flex h-12 items-center justify-center rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-5 text-[15px] font-semibold text-near-black transition-colors hover:border-near-black disabled:opacity-60"
          >
            ← Back
          </button>
        )}

        {step === 1 && (
          <button
            type="button"
            onClick={submitBasics}
            disabled={isPending || !canContinueBasics}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-wise-green px-6 text-[15px] font-semibold text-dark-green shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {isPending ? "Saving…" : "Continue"}
            {!isPending && <span aria-hidden>→</span>}
          </button>
        )}

        {step === 2 && (
          <button
            type="button"
            onClick={submitContent}
            disabled={isPending || isReading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-wise-green px-6 text-[15px] font-semibold text-dark-green shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {isPending
              ? "Saving…"
              : isReading
                ? "Writing details…"
                : "Continue"}
            {!isPending && !isReading && <span aria-hidden>→</span>}
          </button>
        )}

        {step === 3 && (
          <>
            <button
              type="button"
              onClick={() => submitFinal(true)}
              disabled={isPending}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-wise-green px-6 text-[15px] font-semibold text-dark-green shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-14px_rgba(159,232,112,0.7)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {isPending ? "Publishing…" : "Publish"}
              {!isPending && <span aria-hidden>→</span>}
            </button>
            <button
              type="button"
              onClick={() => submitFinal(false)}
              disabled={isPending}
              className="inline-flex h-12 items-center justify-center rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-5 text-[15px] font-semibold text-near-black transition-colors hover:border-near-black disabled:opacity-60"
            >
              Save as draft
            </button>
          </>
        )}
      </div>

      {step === 2 && (
        <p className="mt-3 text-[12px] text-gray">
          Images and files upload as you add them.
        </p>
      )}
    </div>
  );
}
