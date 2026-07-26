"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { getProductById, getProductFiles } from "@/db/queries/products";
import { pricingModel, products } from "@/db/schema";
import { parseTakaInput } from "@/lib/money";
import {
  isProductCategory,
  validateProductFile,
} from "@/lib/product-catalog";

import { requireCreator } from "./_helpers";

const TITLE_MAX = 80;
const SUBTITLE_MAX = 140;
const DESCRIPTION_MAX = 4_000;

const VALID_PRICING = new Set(pricingModel.enumValues);

export interface UpdateProductState {
  ok: boolean;
  error?: string;
}

export async function updateProduct(
  _prevState: UpdateProductState,
  formData: FormData,
): Promise<UpdateProductState> {
  const creator = await requireCreator();

  const productId = formData.get("product_id");
  if (typeof productId !== "string") {
    return { ok: false, error: "Missing product." };
  }
  const product = await getProductById(productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };

  const titleRaw = formData.get("title");
  if (typeof titleRaw !== "string" || !titleRaw.trim()) {
    return { ok: false, error: "Title is required." };
  }
  const title = titleRaw.trim().slice(0, TITLE_MAX);

  const categoryRaw = formData.get("category");
  if (!isProductCategory(categoryRaw)) {
    return { ok: false, error: "Choose a supported product category." };
  }

  const subtitleRaw = formData.get("subtitle");
  const subtitle =
    typeof subtitleRaw === "string" && subtitleRaw.trim()
      ? subtitleRaw.trim().slice(0, SUBTITLE_MAX)
      : null;

  const descriptionRaw = formData.get("description_md");
  const descriptionMd =
    typeof descriptionRaw === "string" && descriptionRaw.trim()
      ? descriptionRaw.trim().slice(0, DESCRIPTION_MAX)
      : null;

  const rightsConfirmed = formData.get("rights_confirmed") === "yes";
  const rightsConfirmedAt =
    product.rightsConfirmedAt ?? (rightsConfirmed ? new Date() : null);

  if (product.isPublished && categoryRaw !== product.category) {
    const files = await getProductFiles(product.id);
    const invalidFile = files.find((file) =>
      validateProductFile({
        category: categoryRaw,
        filename: file.filename,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
      }),
    );
    if (invalidFile) {
      return {
        ok: false,
        error: `${invalidFile.filename} does not fit that category. Remove it or keep the current category.`,
      };
    }
  }

  const pricingRaw = formData.get("pricing_model");
  const pricing =
    typeof pricingRaw === "string" &&
    VALID_PRICING.has(pricingRaw as typeof pricingModel.enumValues[number])
      ? (pricingRaw as typeof pricingModel.enumValues[number])
      : product.pricingModel;

  let basePricePaisa = product.basePricePaisa;
  let minPricePaisa: number | null = product.minPricePaisa;

  if (pricing === "free") {
    basePricePaisa = 0;
    minPricePaisa = null;
  } else {
    const priceRaw = formData.get("base_price");
    if (typeof priceRaw === "string") {
      const parsed = parseTakaInput(priceRaw);
      if (parsed === null || parsed < 0) {
        return { ok: false, error: "Enter a valid taka amount." };
      }
      basePricePaisa = parsed;
    }
    if (pricing === "pay_what_you_want") {
      const minRaw = formData.get("min_price");
      if (typeof minRaw === "string" && minRaw.trim()) {
        const parsed = parseTakaInput(minRaw);
        if (parsed === null || parsed < 0) {
          return { ok: false, error: "Minimum price must be a valid amount." };
        }
        minPricePaisa = parsed;
      } else {
        minPricePaisa = null;
      }
    } else {
      minPricePaisa = null;
    }
  }

  try {
    await db
      .update(products)
      .set({
        title,
        subtitle,
        descriptionMd,
        category: categoryRaw,
        pricingModel: pricing,
        basePricePaisa,
        minPricePaisa,
        rightsConfirmedAt,
        updatedAt: new Date(),
      })
      .where(
        and(eq(products.id, productId), eq(products.creatorId, creator.id)),
      );
  } catch {
    return { ok: false, error: "Couldn't save changes. Please try again." };
  }

  revalidatePath(`/dashboard/shop/${productId}/edit`);
  revalidatePath(`/${creator.handle}/shop`);
  revalidatePath(`/${creator.handle}/shop/${product.slug}`);
  revalidatePath(`/${creator.handle}`);

  return { ok: true };
}
