"use server";

import { and, eq, like, or } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema";
import { titleFromFilename } from "@/lib/filename";
import {
  MAX_PRODUCT_FILENAME_LENGTH,
  PRODUCT_TITLE_MAX,
  inferCategoryFromFilename,
  pickDeliveryModeForFile,
  validateProductFile,
  type DeliveryMode,
  type ProductCategory,
} from "@/lib/product-catalog";
import { slugify } from "@/lib/slug";

import { requireCreator } from "./_helpers";

// Quick start: the creator drops a file before filling anything in.
//
// Uploads are scoped to `creators/{creatorId}/products/{productId}/`, so a row
// has to exist before the file has anywhere to go. Step 1 of the wizard already
// creates one — this does the same thing a moment earlier, deriving the fields
// it can from the file instead of asking for them first.
//
// Everything here is deterministic. No model is involved: the extension gives
// the category, the filename gives the title. That keeps the drop working even
// when the analysis layer is disabled or unavailable.

/** Stop runaway loops if a creator somehow has hundreds of colliding slugs. */
const MAX_SLUG_ATTEMPTS = 50;

export interface DraftShellInput {
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface DraftShellResult {
  ok: boolean;
  error?: string;
  productId?: string;
  category?: ProductCategory;
  deliveryMode?: DeliveryMode;
  title?: string;
  slug?: string;
}

/**
 * Find a free slug for this creator, appending `-2`, `-3`, … on collision.
 *
 * The creator never typed this slug, so a clash is our problem to solve rather
 * than an error to hand back. One query fetches every candidate collision.
 */
async function uniqueSlug(creatorId: string, base: string): Promise<string> {
  const taken = await db
    .select({ slug: products.slug })
    .from(products)
    .where(
      and(
        eq(products.creatorId, creatorId),
        or(eq(products.slug, base), like(products.slug, `${base}-%`)),
      ),
    );

  const used = new Set(taken.map((row) => row.slug));
  if (!used.has(base)) return base;

  for (let suffix = 2; suffix <= MAX_SLUG_ATTEMPTS; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!used.has(candidate)) return candidate;
  }
  // Fall back to a slug that cannot collide rather than failing the drop.
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Create the minimal draft a quick-start upload needs, deriving category,
 * delivery mode, title and slug from the file itself.
 *
 * Returns what it derived so the wizard can show the creator exactly which
 * fields were filled for them.
 */
export async function createProductDraftShell(
  input: DraftShellInput,
): Promise<DraftShellResult> {
  const creator = await requireCreator();

  const filename =
    typeof input.filename === "string"
      ? input.filename.trim().slice(0, MAX_PRODUCT_FILENAME_LENGTH)
      : "";
  if (!filename) return { ok: false, error: "Choose a file to continue." };

  const mimeType =
    typeof input.mimeType === "string" && input.mimeType.trim()
      ? input.mimeType.trim()
      : "application/octet-stream";
  const sizeBytes = Number(input.sizeBytes);

  const category = inferCategoryFromFilename(filename);
  if (!category) {
    return {
      ok: false,
      error:
        "We can't tell what kind of product this is. Choose a category below and add the file in the next step.",
    };
  }

  const deliveryMode = pickDeliveryModeForFile({
    category,
    filename,
    mimeType,
    sizeBytes,
  });
  if (!deliveryMode) {
    // Surface the validator's specific reason — "50 MB or smaller", say —
    // rather than a generic refusal.
    return {
      ok: false,
      error:
        validateProductFile({ category, filename, mimeType, sizeBytes }) ??
        "This shop can't sell that file yet.",
    };
  }

  const title = titleFromFilename(filename, PRODUCT_TITLE_MAX) || "Untitled";
  const slug = await uniqueSlug(creator.id, slugify(title));

  try {
    const [row] = await db
      .insert(products)
      .values({
        creatorId: creator.id,
        title,
        slug,
        category,
        deliveryMode,
        // Left at 0 deliberately: the creator sets the real price in step 1.
        // `validatePublishablePrice` blocks every publish path until they do.
        pricingModel: "fixed",
        basePricePaisa: 0,
      })
      .returning({ id: products.id });

    if (!row?.id) {
      return { ok: false, error: "Couldn't start your product. Try again." };
    }
    return {
      ok: true,
      productId: row.id,
      category,
      deliveryMode,
      title,
      slug,
    };
  } catch {
    return { ok: false, error: "Couldn't start your product. Try again." };
  }
}
