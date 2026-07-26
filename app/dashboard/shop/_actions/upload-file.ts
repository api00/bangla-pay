"use server";

import { randomUUID } from "node:crypto";

import { getProductById } from "@/db/queries/products";
import {
  MAX_PRODUCT_FILENAME_LENGTH,
  validateDeliveryFile,
} from "@/lib/product-catalog";
import { productFilePath } from "@/lib/storage/buckets";
import { signedProductFileUpload } from "@/lib/storage/signed-urls";

import { requireCreator } from "./_helpers";

export interface SignUploadInput {
  productId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface SignUploadResult {
  ok: boolean;
  url?: string;
  storagePath?: string;
  fileId?: string;
  token?: string;
  error?: string;
}

/** Issue a signed PUT URL the browser can use to upload directly to Storage. */
export async function signProductFileUpload(
  input: SignUploadInput,
): Promise<SignUploadResult> {
  const creator = await requireCreator();
  const product = await getProductById(input.productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };

  if (typeof input.filename !== "string" || !input.filename.trim()) {
    return { ok: false, error: "Filename is required." };
  }
  if (!product.category) {
    return {
      ok: false,
      error: "Choose a product category and save Details before uploading.",
    };
  }
  const filename = input.filename
    .trim()
    .slice(0, MAX_PRODUCT_FILENAME_LENGTH);
  const validationError = validateDeliveryFile({
    category: product.category,
    deliveryMode: product.deliveryMode,
    filename,
    mimeType:
      typeof input.mimeType === "string"
        ? input.mimeType
        : "application/octet-stream",
    sizeBytes: input.sizeBytes,
  });
  if (validationError) return { ok: false, error: validationError };

  const fileId = randomUUID();
  const storagePath = productFilePath(creator.id, product.id, fileId, filename);

  try {
    const signed = await signedProductFileUpload(storagePath);
    return {
      ok: true,
      url: signed.url,
      storagePath: signed.path,
      fileId,
      token: signed.token,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Upload failed.",
    };
  }
}
