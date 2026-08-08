"use server";

import { db } from "@/db";
import {
  countRecentAnalyses,
  getCachedSuggestion,
} from "@/db/queries/ai-suggestions";
import { getProductById, getProductFiles } from "@/db/queries/products";
import { productAiSuggestions } from "@/db/schema";
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
// This never writes to `products`. It returns a suggestion; the creator edits
// it in the form and the existing wizard actions do the saving, with all their
// validation intact. That keeps one write path and adds no new trust boundary.

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
  skipped?: "unsupported" | "unreadable" | "disabled" | "rate_limited";
  error?: string;
}

/** Operator-facing log line. Never leaks provider wording to the creator. */
function logFailure(context: Record<string, unknown>, error: unknown) {
  console.error("[ai.analyze-upload]", {
    ...context,
    error: error instanceof Error ? error.message : String(error),
  });
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

  if (!isAiConfigured()) return { ok: true, skipped: "disabled" };

  if (!isAnalysableFile({ mimeType: file.mimeType, sizeBytes: file.sizeBytes })) {
    return { ok: true, skipped: "unsupported" };
  }

  // Cache before spending: the wizard can be stepped back through, and the
  // same file must not be billed twice.
  const cached = await getCachedSuggestion(file.id);
  if (cached?.suggestion) {
    // Rows written before a field existed simply lack it. Fill the gap here
    // rather than letting `undefined` reach a caller that expects an array.
    const stored = cached.suggestion as Partial<ProductSuggestion>;
    return {
      ok: true,
      suggestion: {
        title: stored.title ?? "",
        subtitle: stored.subtitle ?? "",
        description: stored.description ?? "",
        tags: Array.isArray(stored.tags) ? stored.tags : [],
        language: stored.language ?? "unknown",
      },
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
    logFailure({ productId: product.id, fileId: file.id, stage: "download" }, error);
    await recordAttempt({
      productId: product.id,
      fileId: file.id,
      model,
      status: "failed",
      failureReason: "storage download failed",
    });
    return { ok: true, skipped: "unreadable" };
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
    // Not an error the creator needs to act on — the form still works.
    return { ok: true, skipped: "unreadable" };
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
