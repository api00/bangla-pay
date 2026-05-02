"use server";

import { randomUUID } from "node:crypto";

import { and, eq, sql } from "drizzle-orm";
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
const MAX_GALLERY = 8;

// ---------- Sign upload ----------

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

  if ((product.galleryUrls?.length ?? 0) >= MAX_GALLERY) {
    return {
      ok: false,
      error: `Up to ${MAX_GALLERY} images per product.`,
    };
  }

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

// ---------- Commit upload (append to gallery) ----------

export interface CommitCoverInput {
  productId: string;
  storagePath: string;
}

export interface CommitCoverResult {
  ok: boolean;
  publicUrl?: string;
  galleryUrls?: string[];
  error?: string;
}

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
  const nextGallery = [...(product.galleryUrls ?? []), newUrl];
  const nextCover = product.coverUrl ?? newUrl; // first image becomes cover

  try {
    await db
      .update(products)
      .set({
        galleryUrls: nextGallery,
        coverUrl: nextCover,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(products.id, product.id),
          eq(products.creatorId, creator.id),
        ),
      );
  } catch {
    return { ok: false, error: "Couldn't save the image." };
  }

  revalidateAll(creator.handle, product.id, product.slug);
  return { ok: true, publicUrl: newUrl, galleryUrls: nextGallery };
}

// ---------- Remove a gallery image ----------

export interface RemoveImageInput {
  productId: string;
  url: string;
}

export async function removeGalleryImage(
  input: RemoveImageInput,
): Promise<CommitCoverResult> {
  const creator = await requireCreator();
  const product = await getProductById(input.productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };

  const next = (product.galleryUrls ?? []).filter((u) => u !== input.url);
  const nextCover =
    product.coverUrl === input.url ? next[0] ?? null : product.coverUrl;

  try {
    await db
      .update(products)
      .set({
        galleryUrls: next,
        coverUrl: nextCover,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(products.id, product.id),
          eq(products.creatorId, creator.id),
        ),
      );
  } catch {
    return { ok: false, error: "Couldn't remove the image." };
  }

  // Best-effort: delete the underlying object from storage.
  const path = pathFromPublicUrl(input.url);
  if (path) removePublicAsset(path).catch(() => undefined);

  revalidateAll(creator.handle, product.id, product.slug);
  return { ok: true, galleryUrls: next };
}

// ---------- Make an image the primary cover ----------

export async function setPrimaryImage(
  input: RemoveImageInput,
): Promise<CommitCoverResult> {
  const creator = await requireCreator();
  const product = await getProductById(input.productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };

  const gallery = product.galleryUrls ?? [];
  if (!gallery.includes(input.url)) {
    return { ok: false, error: "That image isn't in the gallery." };
  }

  const reordered = [
    input.url,
    ...gallery.filter((u) => u !== input.url),
  ];

  try {
    await db
      .update(products)
      .set({
        galleryUrls: reordered,
        coverUrl: input.url,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(products.id, product.id),
          eq(products.creatorId, creator.id),
        ),
      );
  } catch {
    return { ok: false, error: "Couldn't update the cover." };
  }

  revalidateAll(creator.handle, product.id, product.slug);
  return { ok: true, galleryUrls: reordered };
}

// ---------- Clear everything ----------

export async function clearCover(productId: string): Promise<CommitCoverResult> {
  const creator = await requireCreator();
  const product = await getProductById(productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };

  const previous = product.galleryUrls ?? [];

  try {
    await db
      .update(products)
      .set({
        galleryUrls: sql`'{}'::text[]`,
        coverUrl: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(products.id, product.id),
          eq(products.creatorId, creator.id),
        ),
      );
  } catch {
    return { ok: false, error: "Couldn't clear images." };
  }

  for (const url of previous) {
    const path = pathFromPublicUrl(url);
    if (path) removePublicAsset(path).catch(() => undefined);
  }

  revalidateAll(creator.handle, product.id, product.slug);
  return { ok: true, galleryUrls: [] };
}

// ---------- Helpers ----------

function revalidateAll(handle: string, productId: string, slug: string) {
  revalidatePath(`/dashboard/shop/${productId}/edit`);
  revalidatePath(`/dashboard/shop`);
  revalidatePath(`/${handle}/shop`);
  revalidatePath(`/${handle}/shop/${slug}`);
  revalidatePath(`/${handle}`);
}

function pathFromPublicUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/public-assets/";
  const idx = url.indexOf(marker);
  if (idx < 0) return null;
  return url.slice(idx + marker.length);
}
