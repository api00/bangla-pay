"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { getProductById, getProductFiles } from "@/db/queries/products";
import { pricingModel, products } from "@/db/schema";
import { parseTakaInput } from "@/lib/money";
import {
  getDefaultDeliveryMode,
  isDeliveryMode,
  isDeliveryModeAllowed,
  isProductCategory,
  PRODUCT_DESCRIPTION_MAX,
  PRODUCT_SUBTITLE_MAX,
  PRODUCT_TITLE_MAX,
  validateDeliveryFile,
  validatePublishablePrice,
} from "@/lib/product-catalog";
import { isValidSlug, slugify } from "@/lib/slug";

import { requireCreator } from "./_helpers";

// Server actions backing the three-step new-product wizard.
//
// The wizard presents itself as a single flow with one visible submit at the
// end, but a product row has to exist before step 2: signed uploads are scoped
// to `creators/{creatorId}/products/{productId}/`, so files have nowhere to go
// until the row is there. Step 1 therefore creates an unpublished draft. That
// is invisible plumbing — the creator never sees a "save".

const TITLE_MAX = PRODUCT_TITLE_MAX;
const SUBTITLE_MAX = PRODUCT_SUBTITLE_MAX;
const DESCRIPTION_MAX = PRODUCT_DESCRIPTION_MAX;

const VALID_PRICING = new Set(pricingModel.enumValues);
type PricingModel = (typeof pricingModel.enumValues)[number];

export type WizardField = "title" | "slug" | "category" | "price" | "access";

export interface WizardResult {
  ok: boolean;
  productId?: string;
  error?: string;
  /** Which field to focus/highlight. Lets the UI point at the problem. */
  field?: WizardField;
}

export interface BasicsInput {
  /** Present when the creator stepped back and edited step 1. */
  productId?: string | null;
  title: string;
  slug: string;
  category: string;
  pricingModel: string;
  basePrice: string;
  minPrice: string;
}

/**
 * Step 1 — create the draft (or update it if the creator stepped back).
 *
 * Enforces a positive price for paid products. Without this a `fixed` product
 * could be stored at 0 paisa, which renders a permanently unbuyable page.
 */
export async function saveProductBasics(
  input: BasicsInput,
): Promise<WizardResult> {
  const creator = await requireCreator();

  const title = String(input.title ?? "").trim();
  if (!title) return { ok: false, error: "Title is required.", field: "title" };

  if (!isProductCategory(input.category)) {
    return {
      ok: false,
      error: "Choose a product category.",
      field: "category",
    };
  }
  const category = input.category;

  const slug = String(input.slug ?? "").trim().toLowerCase() || slugify(title);
  if (!isValidSlug(slug)) {
    return {
      ok: false,
      error: "Slug must use lowercase letters, numbers, and hyphens.",
      field: "slug",
    };
  }

  const pricing: PricingModel = VALID_PRICING.has(
    input.pricingModel as PricingModel,
  )
    ? (input.pricingModel as PricingModel)
    : "fixed";

  let basePricePaisa = 0;
  let minPricePaisa: number | null = null;

  if (pricing !== "free") {
    const parsed = parseTakaInput(String(input.basePrice ?? ""));
    if (parsed === null) {
      return {
        ok: false,
        error: "Enter a valid taka amount.",
        field: "price",
      };
    }
    if (parsed <= 0) {
      return {
        ok: false,
        error: "Set a price above ৳0, or choose Free.",
        field: "price",
      };
    }
    basePricePaisa = parsed;

    if (pricing === "pay_what_you_want") {
      const rawMin = String(input.minPrice ?? "").trim();
      if (rawMin) {
        const parsedMin = parseTakaInput(rawMin);
        if (parsedMin === null || parsedMin < 0) {
          return {
            ok: false,
            error: "Minimum must be a valid amount.",
            field: "price",
          };
        }
        if (parsedMin > basePricePaisa) {
          return {
            ok: false,
            error: "Minimum cannot be more than the suggested price.",
            field: "price",
          };
        }
        minPricePaisa = parsedMin;
      }
    }
  }

  // Slug must stay unique per creator. Exclude self when updating.
  const clash = await db
    .select({ id: products.id })
    .from(products)
    .where(
      input.productId
        ? and(
            eq(products.creatorId, creator.id),
            eq(products.slug, slug),
            ne(products.id, input.productId),
          )
        : and(eq(products.creatorId, creator.id), eq(products.slug, slug)),
    )
    .limit(1);
  if (clash.length > 0) {
    return {
      ok: false,
      error: "You already have a product with that slug.",
      field: "slug",
    };
  }

  try {
    if (input.productId) {
      const existing = await getProductById(input.productId, creator.id);
      if (!existing) return { ok: false, error: "Product not found." };

      // Changing category can invalidate the current access mode; snap it back
      // to the category default when it no longer applies.
      const deliveryMode = isDeliveryModeAllowed(category, existing.deliveryMode)
        ? existing.deliveryMode
        : getDefaultDeliveryMode(category);

      await db
        .update(products)
        .set({
          title: title.slice(0, TITLE_MAX),
          slug,
          category,
          deliveryMode,
          pricingModel: pricing,
          basePricePaisa,
          minPricePaisa,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(products.id, input.productId),
            eq(products.creatorId, creator.id),
          ),
        );
      return { ok: true, productId: input.productId };
    }

    const [row] = await db
      .insert(products)
      .values({
        creatorId: creator.id,
        title: title.slice(0, TITLE_MAX),
        slug,
        category,
        deliveryMode: getDefaultDeliveryMode(category),
        pricingModel: pricing,
        basePricePaisa,
        minPricePaisa,
      })
      .returning({ id: products.id });

    if (!row?.id) {
      return { ok: false, error: "Couldn't create product. Please try again." };
    }
    return { ok: true, productId: row.id };
  } catch {
    return { ok: false, error: "Couldn't save. Please try again." };
  }
}

export interface ContentInput {
  productId: string;
  subtitle: string;
  description: string;
}

/** Step 2 — subtitle and description. Images and files save as they upload. */
export async function saveProductContent(
  input: ContentInput,
): Promise<WizardResult> {
  const creator = await requireCreator();
  const product = await getProductById(input.productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };

  const subtitle = String(input.subtitle ?? "").trim();
  const description = String(input.description ?? "").trim();

  try {
    await db
      .update(products)
      .set({
        subtitle: subtitle ? subtitle.slice(0, SUBTITLE_MAX) : null,
        descriptionMd: description
          ? description.slice(0, DESCRIPTION_MAX)
          : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(products.id, input.productId),
          eq(products.creatorId, creator.id),
        ),
      );
  } catch {
    return { ok: false, error: "Couldn't save. Please try again." };
  }
  return { ok: true, productId: input.productId };
}

export interface FinalizeInput {
  productId: string;
  deliveryMode: string;
  rightsConfirmed: boolean;
  publish: boolean;
}

/**
 * Step 3 — buyer access + rights, then publish or leave as a draft.
 *
 * Publishing runs the same deliverable checks as the edit screen so a product
 * can never go live without files that match its access mode.
 */
export async function finalizeProduct(
  input: FinalizeInput,
): Promise<WizardResult> {
  const creator = await requireCreator();
  const product = await getProductById(input.productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };
  if (!product.category) {
    return { ok: false, error: "Go back and choose a category.", field: "category" };
  }
  const category = product.category;

  if (
    !isDeliveryMode(input.deliveryMode) ||
    !isDeliveryModeAllowed(category, input.deliveryMode)
  ) {
    return {
      ok: false,
      error: "Choose how supporters get this product.",
      field: "access",
    };
  }
  const deliveryMode = input.deliveryMode;

  if (input.publish && !input.rightsConfirmed && !product.rightsConfirmedAt) {
    return {
      ok: false,
      error: "Confirm you have the right to sell this product.",
      field: "access",
    };
  }

  const files = await getProductFiles(product.id);

  if (input.publish) {
    // A draft can reach this step priced at 0 when it started as a quick-start
    // shell, so the price has to be re-checked here and not just in step 1.
    const priceError = validatePublishablePrice({
      pricingModel: product.pricingModel,
      basePricePaisa: product.basePricePaisa,
    });
    if (priceError) {
      return { ok: false, error: priceError, field: "price" };
    }
    if (files.length === 0) {
      return {
        ok: false,
        error: "Add at least one file before publishing.",
      };
    }
    const invalid = files.find((file) =>
      validateDeliveryFile({
        category,
        deliveryMode,
        filename: file.filename,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
      }),
    );
    if (invalid) {
      return {
        ok: false,
        error: `${invalid.filename} doesn't support ${deliveryMode.replaceAll("_", " ")} access. Remove it or pick another option.`,
        field: "access",
      };
    }
  }

  try {
    await db
      .update(products)
      .set({
        deliveryMode,
        rightsConfirmedAt:
          product.rightsConfirmedAt ??
          (input.rightsConfirmed ? new Date() : null),
        isPublished: input.publish,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(products.id, input.productId),
          eq(products.creatorId, creator.id),
        ),
      );
  } catch {
    return { ok: false, error: "Couldn't save. Please try again." };
  }

  revalidatePath("/dashboard/shop");
  revalidatePath(`/dashboard/shop/${input.productId}/edit`);
  revalidatePath(`/${creator.handle}`);
  revalidatePath(`/${creator.handle}/shop`);
  revalidatePath(`/${creator.handle}/shop/${product.slug}`);

  return { ok: true, productId: input.productId };
}
