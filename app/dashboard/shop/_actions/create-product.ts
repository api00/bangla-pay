"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { pricingModel, products } from "@/db/schema";
import { isValidSlug, slugify } from "@/lib/slug";
import { parseTakaInput } from "@/lib/money";

import { requireCreator } from "./_helpers";

const TITLE_MAX = 80;

export interface CreateProductState {
  ok: boolean;
  error?: string;
}

const VALID_PRICING = new Set(pricingModel.enumValues);

export async function createProduct(
  _prevState: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  const creator = await requireCreator();

  const titleRaw = formData.get("title");
  if (typeof titleRaw !== "string" || !titleRaw.trim()) {
    return { ok: false, error: "Title is required." };
  }
  const title = titleRaw.trim().slice(0, TITLE_MAX);

  const slugRaw = formData.get("slug");
  let slug =
    typeof slugRaw === "string" && slugRaw.trim()
      ? slugRaw.trim().toLowerCase()
      : slugify(title);
  if (!isValidSlug(slug)) {
    return {
      ok: false,
      error: "Slug must use lowercase letters, numbers, and hyphens.",
    };
  }

  const pricingRaw = formData.get("pricing_model");
  const pricing =
    typeof pricingRaw === "string" &&
    VALID_PRICING.has(pricingRaw as typeof pricingModel.enumValues[number])
      ? (pricingRaw as typeof pricingModel.enumValues[number])
      : "fixed";

  const priceRaw = formData.get("base_price");
  let basePricePaisa = 0;
  if (pricing === "free") {
    basePricePaisa = 0;
  } else {
    if (typeof priceRaw !== "string" || !priceRaw.trim()) {
      return { ok: false, error: "Set a price (or pick Free)." };
    }
    const parsed = parseTakaInput(priceRaw);
    if (parsed === null || parsed < 0) {
      return { ok: false, error: "Enter a valid taka amount." };
    }
    basePricePaisa = parsed;
  }

  // Best-effort uniqueness check; DB unique index is the source of truth.
  const existing = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.creatorId, creator.id), eq(products.slug, slug)))
    .limit(1);
  if (existing.length > 0) {
    return {
      ok: false,
      error: "You already have a product with that slug. Pick another.",
    };
  }

  let insertedId: string | undefined;
  try {
    const [row] = await db
      .insert(products)
      .values({
        creatorId: creator.id,
        title,
        slug,
        pricingModel: pricing,
        basePricePaisa,
      })
      .returning({ id: products.id });
    insertedId = row?.id;
  } catch {
    return { ok: false, error: "Couldn't create product. Please try again." };
  }

  if (!insertedId) {
    return { ok: false, error: "Couldn't create product. Please try again." };
  }

  // Land on the images section so creators can immediately upload photos.
  redirect(`/dashboard/shop/${insertedId}/edit#images`);
}
