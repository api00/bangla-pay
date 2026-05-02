"use server";

import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { getProductById } from "@/db/queries/products";
import { products } from "@/db/schema";
import { productCoverPath } from "@/lib/storage/buckets";
import {
  publicAssetUrl,
  removePublicAsset,
  signedPublicAssetUpload,
} from "@/lib/storage/signed-urls";

import { requireCreator } from "./_helpers";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_FILENAME = 200;

export interface SignCoverUploadInput {
  productId: string;
  filename: string;
  mimeType: string;
}

export interface SignCoverUploadResult {
  ok: boolean;
  url?: string;
  storagePath?: string;
  error?: string;
}

/** Step 1: client requests a signed PUT URL targeting the public-assets bucket. */
export async function signCoverUpload(
  input: SignCoverUploadInput,
): Promise<SignCoverUploadResult> {
  const creator = await requireCreator();
  const product = await getProductById(input.productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };

  if (typeof input.filename !== "string" || !input.filename.trim()) {
    return { ok: false, error: "Filename is required." };
  }
  if (!ALLOWED_MIME.has(input.mimeType)) {
    return {
      ok: false,
      error: "Only JPEG, PNG, WebP, GIF, or AVIF images are allowed.",
    };
  }

  const filename = input.filename.trim().slice(0, MAX_FILENAME);
  const imageId = randomUUID();
  const storagePath = productCoverPath(
    creator.id,
    product.id,
    imageId,
    filename,
  );

  try {
    const signed = await signedPublicAssetUpload(storagePath);
    return { ok: true, url: signed.url, storagePath: signed.path };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Upload failed.",
    };
  }
}

export interface CommitCoverInput {
  productId: string;
  storagePath: string;
}

export interface CommitCoverResult {
  ok: boolean;
  publicUrl?: string;
  error?: string;
}

/** Step 2: client confirms the upload finished. We swap the stored public URL
 *  and clean up the previous cover (best-effort) so abandoned files don't
 *  pile up in the bucket. */
export async function commitCoverUpload(
  input: CommitCoverInput,
): Promise<CommitCoverResult> {
  const creator = await requireCreator();
  const product = await getProductById(input.productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };

  if (
    typeof input.storagePath !== "string" ||
    !input.storagePath.startsWith(`creators/${creator.id}/products/${product.id}/`)
  ) {
    return { ok: false, error: "Storage path mismatch." };
  }

  const newUrl = publicAssetUrl(input.storagePath);
  const previousUrl = product.coverUrl;

  try {
    await db
      .update(products)
      .set({ coverUrl: newUrl, updatedAt: new Date() })
      .where(
        and(
          eq(products.id, product.id),
          eq(products.creatorId, creator.id),
        ),
      );
  } catch {
    return { ok: false, error: "Couldn't save the cover image." };
  }

  // Best-effort: delete the previous cover if it lived in the public bucket.
  if (previousUrl) {
    const prevPath = pathFromPublicUrl(previousUrl);
    if (prevPath) {
      removePublicAsset(prevPath).catch(() => {
        /* ignore — cleanup is non-critical */
      });
    }
  }

  revalidatePath(`/dashboard/shop/${product.id}/edit`);
  revalidatePath(`/${creator.handle}/shop`);
  revalidatePath(`/${creator.handle}/shop/${product.slug}`);
  revalidatePath(`/${creator.handle}`);
  return { ok: true, publicUrl: newUrl };
}

export async function clearCover(productId: string): Promise<CommitCoverResult> {
  const creator = await requireCreator();
  const product = await getProductById(productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };

  const previousUrl = product.coverUrl;

  try {
    await db
      .update(products)
      .set({ coverUrl: null, updatedAt: new Date() })
      .where(
        and(
          eq(products.id, product.id),
          eq(products.creatorId, creator.id),
        ),
      );
  } catch {
    return { ok: false, error: "Couldn't remove the cover image." };
  }

  if (previousUrl) {
    const prevPath = pathFromPublicUrl(previousUrl);
    if (prevPath) {
      removePublicAsset(prevPath).catch(() => {
        /* ignore */
      });
    }
  }

  revalidatePath(`/dashboard/shop/${product.id}/edit`);
  revalidatePath(`/${creator.handle}/shop`);
  revalidatePath(`/${creator.handle}/shop/${product.slug}`);
  revalidatePath(`/${creator.handle}`);
  return { ok: true };
}

/** Extract the `creators/.../cover-...` path from a Supabase public URL. */
function pathFromPublicUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/public-assets/";
  const idx = url.indexOf(marker);
  if (idx < 0) return null;
  return url.slice(idx + marker.length);
}
