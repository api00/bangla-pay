import "server-only";

import { z } from "zod";

import {
  PRODUCT_DESCRIPTION_MAX,
  PRODUCT_SUBTITLE_MAX,
  PRODUCT_TITLE_MAX,
  type ProductCategory,
} from "@/lib/product-catalog";
import { MAX_PRODUCT_TAGS, normaliseTags } from "@/lib/product-tags";
import { clampText } from "@/lib/text";

import {
  requestStructured,
  type ResponsesInputPart,
} from "./client";

// Reading an uploaded file into draft listing fields.
//
// Everything here treats the model's output as untrusted input, because that
// is exactly what it is. The strict JSON schema fixes the shape; this file
// decides whether the contents are usable and clamps them to the same limits
// the database and the manual form enforce.

/**
 * Only files a model can actually read get sent.
 *
 * Audio is absent on purpose: these models have no audio input, so an MP3
 * would cost a request and return guesses drawn from the filename alone.
 * Archives are absent because their contents are opaque without unpacking.
 * Both fall back to the filename-derived title from the quick-start drop.
 */
const READABLE_MIME_PREFIXES = ["image/"] as const;
const READABLE_MIME_TYPES = new Set(["application/pdf"]);

/**
 * Cap what we upload per request. Independent of the 50 MB product limit:
 * a large PDF is billed per page, so an unbounded cap turns one drop into a
 * surprising bill. Oversized files degrade to manual entry.
 */
export const MAX_ANALYSIS_BYTES = 12 * 1024 * 1024;

/** SVG is text, not a raster the vision path can sample. */
const UNREADABLE_IMAGE_TYPES = new Set(["image/svg+xml"]);

export function isAnalysableFile(input: {
  mimeType: string;
  sizeBytes: number;
}): boolean {
  const mimeType = input.mimeType.trim().toLowerCase();
  if (input.sizeBytes <= 0 || input.sizeBytes > MAX_ANALYSIS_BYTES) return false;
  if (UNREADABLE_IMAGE_TYPES.has(mimeType)) return false;
  if (READABLE_MIME_TYPES.has(mimeType)) return true;
  return READABLE_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
}

// The schema sent to the API. Strict mode requires every property listed in
// `required` and forbids extras, so optional fields are modelled as nullable.
const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "subtitle", "description", "tags", "language", "readable"],
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    description: { type: "string" },
    tags: {
      type: "array",
      maxItems: MAX_PRODUCT_TAGS,
      items: { type: "string" },
    },
    language: { type: "string", enum: ["en", "bn", "mixed", "unknown"] },
    readable: { type: "boolean" },
  },
} as const;

// What we accept back. Deliberately stricter than the wire schema: empty
// strings and overlong values are shape-valid but useless.
const suggestionSchema = z.object({
  title: z.string().trim().min(1).max(PRODUCT_TITLE_MAX * 2),
  subtitle: z.string().trim().max(PRODUCT_SUBTITLE_MAX * 2),
  description: z.string().trim().max(PRODUCT_DESCRIPTION_MAX * 2),
  // Length is not capped here: an extra tag is a formatting overrun, not a
  // reason to discard the whole read. normaliseTags trims and de-duplicates.
  tags: z.array(z.string()),
  language: z.enum(["en", "bn", "mixed", "unknown"]),
  readable: z.boolean(),
});

export interface ProductSuggestion {
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  language: "en" | "bn" | "mixed" | "unknown";
}

export type AnalysisOutcome =
  | { status: "ok"; suggestion: ProductSuggestion; inputTokens: number | null; outputTokens: number | null }
  | { status: "unreadable"; reason: string; inputTokens: number | null; outputTokens: number | null };

const CATEGORY_CONTEXT: Record<ProductCategory, string> = {
  ebook: "a written work — a book, guide, worksheet, or printable",
  audio: "an audio product",
  design_asset:
    "a design asset — a template, illustration, photo pack, or printable graphic",
};

/**
 * Price is absent from the schema on purpose.
 *
 * Testing showed cheaper models returning confident taka figures with nothing
 * in the file to support them, and pricing is a business decision the creator
 * owns. A wrong suggested number anchors them; no number costs them nothing.
 */
function buildPrompt(category: ProductCategory, filename: string): string {
  return [
    "You are drafting a shop listing for a Bangladeshi creator selling on BanglaPay.",
    `The uploaded file is ${CATEGORY_CONTEXT[category]}. Its filename is "${filename}".`,
    "",
    "Write a title, a one-line tagline, a short description of what a buyer gets,",
    "and search tags a supporter would plausibly type to find it.",
    "",
    "Rules:",
    "- Use ONLY what is actually visible in the file.",
    "- Never invent an author, page count, duration, award, price, rating, or review.",
    "- Never claim it is bestselling, popular, award-winning, or highly rated.",
    "- No marketing hype. Describe what it is, plainly, as the creator would.",
    "- Write in the language the file itself uses. If it is Bangla, answer in Bangla.",
    `- Title: under ${PRODUCT_TITLE_MAX} characters. Do not repeat the tagline in it.`,
    `- Tagline: under ${PRODUCT_SUBTITLE_MAX} characters, no trailing full stop.`,
    "- Description: 2 to 4 sentences.",
    `- Tags: up to ${MAX_PRODUCT_TAGS}, lowercase, one or two words each. Subject`,
    "  matter and format only — never the creator's name, never 'best' or",
    "  'free'. If the file is in Bangla, Bangla tags are correct.",
    "",
    "If the file is blank, corrupt, or shows nothing you can describe, set",
    "readable to false and leave the three text fields empty. Guessing is worse",
    "than admitting the file gave you nothing.",
  ].join("\n");
}

function buildFilePart(input: {
  mimeType: string;
  filename: string;
  base64: string;
}): ResponsesInputPart {
  const dataUrl = `data:${input.mimeType};base64,${input.base64}`;
  if (input.mimeType.toLowerCase() === "application/pdf") {
    return { type: "input_file", filename: input.filename, file_data: dataUrl };
  }
  return { type: "input_image", image_url: dataUrl, detail: "auto" };
}

/**
 * Read a file into draft listing fields.
 *
 * Throws only when the request itself fails — an unreadable file is a normal
 * outcome and comes back as `status: "unreadable"`.
 */
export async function analyseProductFile(input: {
  category: ProductCategory;
  filename: string;
  mimeType: string;
  bytes: Uint8Array;
}): Promise<AnalysisOutcome> {
  const base64 = Buffer.from(input.bytes).toString("base64");

  const response = await requestStructured({
    schemaName: "product_listing_draft",
    schema: RESPONSE_SCHEMA as unknown as Record<string, unknown>,
    parts: [
      buildFilePart({
        mimeType: input.mimeType,
        filename: input.filename,
        base64,
      }),
      { type: "input_text", text: buildPrompt(input.category, input.filename) },
    ],
  });

  const tokens = {
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
  };

  let raw: unknown;
  try {
    raw = JSON.parse(response.text);
  } catch {
    return { status: "unreadable", reason: "Model returned invalid JSON.", ...tokens };
  }

  const parsed = suggestionSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "unreadable",
      reason: `Failed validation: ${parsed.error.issues[0]?.message ?? "unknown"}`,
      ...tokens,
    };
  }

  if (!parsed.data.readable || !parsed.data.title) {
    return { status: "unreadable", reason: "Nothing readable in the file.", ...tokens };
  }

  // Clamp last, to the same limits the manual form enforces. The model was
  // asked to stay inside them; this is what makes it true. Grapheme-aware,
  // because a Bangla title cut mid-character renders as broken text.
  return {
    status: "ok",
    suggestion: {
      title: clampText(parsed.data.title, PRODUCT_TITLE_MAX).trim(),
      subtitle: clampText(parsed.data.subtitle, PRODUCT_SUBTITLE_MAX).trim(),
      description: clampText(
        parsed.data.description,
        PRODUCT_DESCRIPTION_MAX,
      ).trim(),
      tags: normaliseTags(parsed.data.tags),
      language: parsed.data.language,
    },
    ...tokens,
  };
}
