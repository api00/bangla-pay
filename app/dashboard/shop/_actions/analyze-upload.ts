"use server";

import { and, eq, isNull, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  countRecentAnalyses,
  getCachedSuggestion,
} from "@/db/queries/ai-suggestions";
import { getProductById, getProductFiles } from "@/db/queries/products";
import { productAiSuggestions, products } from "@/db/schema";
import { getAiModel, isAiConfigured } from "@/lib/ai/client";
import {
  analyseProductFile,
  isAnalysableFile,
  type ProductSuggestion,
} from "@/lib/ai/product-analysis";
import { downloadProductFile } from "@/lib/storage/signed-urls";

import { requireCreator } from "./_helpers";

// Read an uploaded file into draft listing fields.
//
// A successful suggestion is returned to the form and also copied into empty
// product fields as draft recovery. Creator-written fields are never replaced.

/** Per creator, per hour. Generous for real use, bounded for a runaway loop. */
const ANALYSES_PER_HOUR = 30;
const HOUR_MS = 60 * 60 * 1000;

export interface AnalyzeUploadInput {
  productId: string;
  fileId: string;
}

export interface AnalyzeUploadResult {
  ok: boolean;
  /** Present only when a usable draft came back. */
  suggestion?: ProductSuggestion;
  /**
   * Set when the attempt ended without a suggestion for an expected reason.
   * Shown to the creator as a quiet note, never as an error.
   */
  skipped?: AnalysisSkipReason;
  error?: string;
}

export type AnalysisSkipReason =
  | "unsupported"
  | "unreadable"
  | "disabled"
  | "rate_limited";

/** Operator-facing log line. Never leaks provider wording to the creator. */
function logFailure(context: Record<string, unknown>, error: unknown) {
  console.error("[ai.analyze-upload]", {
    ...context,
    error: error instanceof Error ? error.message : String(error),
  });
}

/**
 * Keep a successful draft even if the creator refreshes or leaves the wizard.
 *
 * Each field is updated independently and only while it is empty, so an AI
 * result can never replace text the creator has already saved. The client
 * still receives the suggestion immediately for the controlled form fields.
 */
async function persistSuggestionToEmptyFields(input: {
  creatorId: string;
  productId: string;
  suggestion: ProductSuggestion;
}): Promise<void> {
  const scope = and(
    eq(products.id, input.productId),
    eq(products.creatorId, input.creatorId),
  );

  try {
    if (input.suggestion.subtitle) {
      await db
        .update(products)
        .set({
          subtitle: input.suggestion.subtitle,
          updatedAt: new Date(),
        })
        .where(
          and(
            scope,
            or(isNull(products.subtitle), eq(products.subtitle, "")),
          ),
        );
    }

    if (input.suggestion.description) {
      await db
        .update(products)
        .set({
          descriptionMd: input.suggestion.description,
          updatedAt: new Date(),
        })
        .where(
          and(
            scope,
            or(
              isNull(products.descriptionMd),
              eq(products.descriptionMd, ""),
            ),
          ),
        );
    }

    if (input.suggestion.tags.length > 0) {
      await db
        .update(products)
        .set({
          tags: input.suggestion.tags,
          updatedAt: new Date(),
        })
        .where(and(scope, sql`cardinality(${products.tags}) = 0`));
    }

    revalidatePath(`/dashboard/shop/${input.productId}/edit`);
  } catch (error) {
    // The suggestion is still useful in the current form. Persistence is a
    // recovery layer, so a database hiccup must not discard the AI result.
    logFailure(
      { productId: input.productId, stage: "persist-suggestion" },
      error,
    );
  }
}

function storedSuggestion(value: unknown): ProductSuggestion | null {
  if (!value || typeof value !== "object") return null;
  const stored = value as Partial<ProductSuggestion>;
  const language = ["en", "bn", "mixed", "unknown"].includes(
    String(stored.language),
  )
    ? (stored.language as ProductSuggestion["language"])
    : "unknown";
  const suggestion = {
    title: typeof stored.title === "string" ? stored.title.trim() : "",
    subtitle:
      typeof stored.subtitle === "string" ? stored.subtitle.trim() : "",
    description:
      typeof stored.description === "string"
        ? stored.description.trim()
        : "",
    tags: Array.isArray(stored.tags)
      ? stored.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    language,
  };

  // Old/incomplete cache rows must not permanently poison this file. The
  // product listing needs all three written fields to count as a cache hit.
  return suggestion.title && suggestion.subtitle && suggestion.description
    ? suggestion
    : null;
}

export async function analyzeProductUpload(
  input: AnalyzeUploadInput,
): Promise<AnalyzeUploadResult> {
  const creator = await requireCreator();
  const product = await getProductById(input.productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };
  if (!product.category) {
    return { ok: false, error: "Choose a category first." };
  }
  const category = product.category;

  // Ownership: the file has to belong to this creator's product. Never trust
  // a fileId from the client on its own.
  const files = await getProductFiles(product.id);
  const file = files.find((candidate) => candidate.id === input.fileId);
  if (!file) return { ok: false, error: "File not found." };

  if (!isAiConfigured()) {
    logFailure(
      { productId: product.id, fileId: file.id, stage: "config" },
      new Error("OPENAI_API_KEY is not configured in this runtime."),
    );
    return { ok: true, skipped: "disabled" };
  }

  if (!isAnalysableFile({
    category,
    filename: file.filename,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
  })) {
    return { ok: true, skipped: "unsupported" };
  }

  // Cache before spending: the wizard can be stepped back through, and the
  // same file must not be billed twice.
  const cached = await getCachedSuggestion(file.id);
  const cachedSuggestion = storedSuggestion(cached?.suggestion);
  if (cachedSuggestion) {
    await persistSuggestionToEmptyFields({
      creatorId: creator.id,
      productId: product.id,
      suggestion: cachedSuggestion,
    });
    return {
      ok: true,
      suggestion: cachedSuggestion,
    };
  }

  const recent = await countRecentAnalyses(
    creator.id,
    new Date(Date.now() - HOUR_MS),
  );
  if (recent >= ANALYSES_PER_HOUR) {
    return { ok: true, skipped: "rate_limited" };
  }

  const model = getAiModel();

  let bytes: Uint8Array;
  try {
    bytes = await downloadProductFile(file.storagePath);
  } catch (error) {
    logFailure(
      { productId: product.id, fileId: file.id, stage: "download" },
      error,
    );
    await recordAttempt({
      productId: product.id,
      fileId: file.id,
      model,
      status: "failed",
      failureReason: "storage download failed",
    });
    return {
      ok: false,
      error:
        "We couldn't download that file for automatic writing. Try again or continue manually.",
    };
  }

  try {
    const outcome = await analyseProductFile({
      category,
      filename: file.filename,
      mimeType: file.mimeType,
      bytes,
    });

    if (outcome.status === "unreadable") {
      await recordAttempt({
        productId: product.id,
        fileId: file.id,
        model,
        status: "unreadable",
        failureReason: outcome.reason,
        inputTokens: outcome.inputTokens,
        outputTokens: outcome.outputTokens,
      });
      return { ok: true, skipped: "unreadable" };
    }

    await recordAttempt({
      productId: product.id,
      fileId: file.id,
      model,
      status: "ok",
      suggestion: outcome.suggestion,
      inputTokens: outcome.inputTokens,
      outputTokens: outcome.outputTokens,
    });
    await persistSuggestionToEmptyFields({
      creatorId: creator.id,
      productId: product.id,
      suggestion: outcome.suggestion,
    });
    return { ok: true, suggestion: outcome.suggestion };
  } catch (error) {
    logFailure({ productId: product.id, fileId: file.id, stage: "analyse" }, error);
    await recordAttempt({
      productId: product.id,
      fileId: file.id,
      model,
      status: "failed",
      failureReason:
        error instanceof Error ? error.message.slice(0, 500) : "unknown",
    });
    return {
      ok: false,
      error: "Automatic writing failed. Try again or continue manually.",
    };
  }
}

/**
 * Record the attempt. Best-effort: losing the audit row must never take down
 * a suggestion the creator is already looking at.
 */
async function recordAttempt(input: {
  productId: string;
  fileId: string;
  model: string;
  status: "ok" | "unreadable" | "failed";
  suggestion?: ProductSuggestion;
  failureReason?: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
}): Promise<void> {
  try {
    await db.insert(productAiSuggestions).values({
      productId: input.productId,
      productFileId: input.fileId,
      model: input.model,
      status: input.status,
      suggestion: input.suggestion ?? null,
      failureReason: input.failureReason ?? null,
      inputTokens: input.inputTokens ?? null,
      outputTokens: input.outputTokens ?? null,
    });
  } catch (error) {
    logFailure({ productId: input.productId, stage: "record" }, error);
  }
}
