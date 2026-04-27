"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { getProductById } from "@/db/queries/products";
import { productFiles } from "@/db/schema";

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
): Promise<{ ok: boolean; error?: string }> {
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

  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0) {
    return { ok: false, error: "Invalid file size." };
  }

  await db.insert(productFiles).values({
    productId: product.id,
    storagePath: input.storagePath,
    filename: input.filename,
    mimeType: input.mimeType || "application/octet-stream",
    sizeBytes: input.sizeBytes,
  });

  revalidatePath(`/dashboard/shop/${product.id}/edit`);
  return { ok: true };
}
