"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { getProductById, getProductFiles } from "@/db/queries/products";
import { products } from "@/db/schema";
import {
  validateDeliveryFile,
  validatePublishablePrice,
} from "@/lib/product-catalog";

import { requireCreator } from "./_helpers";

export interface PublishProductInput {
  productId: string;
  publish: boolean;
}

/** Toggle a product's `is_published` flag after validating its deliverable. */
export async function setProductPublished(
  input: PublishProductInput,
): Promise<{ ok: boolean; error?: string }> {
  const creator = await requireCreator();
  const product = await getProductById(input.productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };

  if (input.publish) {
    if (!product.category) {
      return {
        ok: false,
        error: "Choose a product category in Details and save it first.",
      };
    }
    const category = product.category;
    const priceError = validatePublishablePrice({
      pricingModel: product.pricingModel,
      basePricePaisa: product.basePricePaisa,
    });
    if (priceError) return { ok: false, error: priceError };
    if (!product.rightsConfirmedAt) {
      return {
        ok: false,
        error: "Confirm your right to sell this product in Details first.",
      };
    }
    if (product.productType === "digital_download") {
      const files = await getProductFiles(product.id);
      if (files.length === 0) {
        return {
          ok: false,
          error: "Add at least one downloadable file before publishing.",
        };
      }
      const invalidFile = files.find((file) =>
        validateDeliveryFile({
          category,
          deliveryMode: product.deliveryMode,
          filename: file.filename,
          mimeType: file.mimeType,
          sizeBytes: file.sizeBytes,
        }),
      );
      if (invalidFile) {
        return {
          ok: false,
          error: `${invalidFile.filename} does not support ${product.deliveryMode.replaceAll("_", " ")} access. Remove it or choose another delivery option.`,
        };
      }
    }
    if (
      product.productType === "external_link" &&
      !product.externalUrl
    ) {
      return {
        ok: false,
        error: "Set an external URL before publishing this product.",
      };
    }
  }

  await db
    .update(products)
    .set({ isPublished: input.publish, updatedAt: new Date() })
    .where(
      and(
        eq(products.id, input.productId),
        eq(products.creatorId, creator.id),
      ),
    );

  revalidatePath(`/dashboard/shop`);
  revalidatePath(`/dashboard/shop/${input.productId}/edit`);
  revalidatePath(`/${creator.handle}`);
  revalidatePath(`/${creator.handle}/shop`);
  revalidatePath(`/${creator.handle}/shop/${product.slug}`);

  return { ok: true };
}
