import "server-only";

/** All storage buckets used by the app. Single source of truth. */
export const BUCKETS = {
  /** Private — gated by signed URLs only. Never make public. */
  PRODUCT_FILES: "product-files",
  /** Public read — avatars, covers. */
  PUBLIC_ASSETS: "public-assets",
} as const;

/** Build the storage path for a product file. */
export function productFilePath(
  creatorId: string,
  productId: string,
  fileId: string,
  filename: string,
): string {
  // Sanitize filename: strip path separators and control chars.
  const safeFilename = filename.replace(/[\\/]/g, "_").replace(/[\x00-\x1f]/g, "");
  return `creators/${creatorId}/products/${productId}/${fileId}-${safeFilename}`;
}

/**
 * Build the storage path for a public product cover image.
 * Public bucket: anyone can fetch the resulting URL.
 */
export function productCoverPath(
  creatorId: string,
  productId: string,
  imageId: string,
  filename: string,
): string {
  const safeFilename = filename
    .replace(/[\\/]/g, "_")
    .replace(/[\x00-\x1f]/g, "")
    .toLowerCase();
  return `creators/${creatorId}/products/${productId}/cover-${imageId}-${safeFilename}`;
}
