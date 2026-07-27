"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { getProductById } from "@/db/queries/products";
import { productFiles, type ProductFile } from "@/db/schema";
import {
  MAX_PRODUCT_FILENAME_LENGTH,
  validateDeliveryFile,
} from "@/lib/product-catalog";
import { removeStorageObject } from "@/lib/storage/signed-urls";

import { requireCreator } from "./_helpers";

export interface RegisterFileInput {
  productId: string;
  storagePath: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

/** Called after the browser successfully PUT the file to Storage. */
export async function registerProductFile(
  input: RegisterFileInput,
): Promise<{ ok: boolean; error?: string; file?: ProductFile }> {
  const creator = await requireCreator();
  const product = await getProductById(input.productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };

  if (
    !input.storagePath ||
    !input.storagePath.startsWith(`creators/${creator.id}/products/${product.id}/`)
  ) {
    // Path didn't match the expected scope — refuse to record it.
    return { ok: false, error: "Invalid upload path." };
  }

  if (!product.category) {
    await removeStorageObject(input.storagePath);
    return {
      ok: false,
      error: "Choose a product category and save Details before uploading.",
    };
  }

  const filename =
    typeof input.filename === "string"
      ? input.filename.trim().slice(0, MAX_PRODUCT_FILENAME_LENGTH)
      : "";
  const mimeType =
    typeof input.mimeType === "string" && input.mimeType.trim()
      ? input.mimeType.trim()
      : "application/octet-stream";
  const validationError = validateDeliveryFile({
    category: product.category,
    deliveryMode: product.deliveryMode,
    filename,
    mimeType,
    sizeBytes: input.sizeBytes,
  });
  if (validationError) {
    await removeStorageObject(input.storagePath);
    return { ok: false, error: validationError };
  }

  let created;
  try {
    // Return the row so the uploader can show the file immediately, without
    // waiting on a server round-trip that the wizard never makes.
    const [row] = await db
      .insert(productFiles)
      .values({
        productId: product.id,
        storagePath: input.storagePath,
        filename,
        mimeType,
        sizeBytes: input.sizeBytes,
      })
      .returning();
    created = row;
  } catch {
    await removeStorageObject(input.storagePath);
    return { ok: false, error: "Couldn't save the uploaded file." };
  }

  revalidatePath(`/dashboard/shop/${product.id}/edit`);
  return { ok: true, file: created };
}
