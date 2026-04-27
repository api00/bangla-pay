"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { getProductById, getProductFiles } from "@/db/queries/products";
import { products } from "@/db/schema";

import { requireCreator } from "./_helpers";

export interface PublishProductInput {
  productId: string;
  publish: boolean;
}

/** Toggle a product's `is_published` flag. Refuses to publish a fixed-price
 *  product with no files (so supporters never buy a paid product without
 *  a deliverable). Free + external products are exempt. */
export async function setProductPublished(
  input: PublishProductInput,
): Promise<{ ok: boolean; error?: string }> {
  const creator = await requireCreator();
  const product = await getProductById(input.productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };

  if (input.publish) {
    if (
      product.productType === "digital_download" &&
      product.pricingModel !== "free"
    ) {
      const files = await getProductFiles(product.id);
      if (files.length === 0) {
        return {
          ok: false,
          error: "Add at least one file before publishing a paid product.",
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
