import "server-only";

import { createAdminClient } from "@/utils/supabase/admin";

import { BUCKETS } from "./buckets";

const UPLOAD_EXPIRES_IN_SECONDS = 60 * 5; // 5 minutes — uploads should start immediately
const DOWNLOAD_EXPIRES_IN_SECONDS = 60 * 5; // 5 min — short-lived stream URL

export interface SignedUpload {
  /** PUT this URL with the file body. Browser sends `Content-Type` header. */
  url: string;
  /** Storage object path (the `storage_path` to record in the DB). */
  path: string;
  token: string;
}

/**
 * Issue a signed upload URL for the private product-files bucket.
 * Throws if Storage is misconfigured.
 */
export async function signedProductFileUpload(
  storagePath: string,
): Promise<SignedUpload> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKETS.PRODUCT_FILES)
    .createSignedUploadUrl(storagePath);
  if (error || !data) {
    throw new Error(
      `Storage upload URL failed: ${error?.message ?? "unknown error"}`,
    );
  }
  return {
    url: data.signedUrl,
    path: storagePath,
    token: data.token,
  };
}

/** Time-limited signed URL for streaming a product file to a paid supporter. */
export async function signedProductFileDownload(
  storagePath: string,
  filename?: string,
): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKETS.PRODUCT_FILES)
    .createSignedUrl(storagePath, DOWNLOAD_EXPIRES_IN_SECONDS, {
      download: filename ?? true,
    });
  if (error || !data) {
    throw new Error(
      `Storage download URL failed: ${error?.message ?? "unknown error"}`,
    );
  }
  return data.signedUrl;
}

/** Time-limited URL without an attachment header, for server-side proxying. */
export async function signedProductFileAccess(
  storagePath: string,
): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKETS.PRODUCT_FILES)
    .createSignedUrl(storagePath, DOWNLOAD_EXPIRES_IN_SECONDS);
  if (error || !data) {
    throw new Error(
      `Storage access URL failed: ${error?.message ?? "unknown error"}`,
    );
  }
  return data.signedUrl;
}

/** Remove a stored object — safe to call even if the object is already gone. */
/**
 * Pull a product file into memory on the server.
 *
 * Uploads go browser → Storage directly, so the server has never seen these
 * bytes. Anything that needs to inspect a file has to fetch it back.
 * Callers must bound the size themselves — this loads the whole object.
 */
export async function downloadProductFile(
  storagePath: string,
): Promise<Uint8Array> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKETS.PRODUCT_FILES)
    .download(storagePath);
  if (error || !data) {
    throw new Error(
      `Storage download failed: ${error?.message ?? "unknown error"}`,
    );
  }
  return new Uint8Array(await data.arrayBuffer());
}

export async function removeStorageObject(storagePath: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.storage.from(BUCKETS.PRODUCT_FILES).remove([storagePath]);
}

/**
 * Issue a signed upload URL for the PUBLIC bucket. After upload, callers
 * get the permanent public URL via `publicAssetUrl(path)`.
 */
export async function signedPublicAssetUpload(
  storagePath: string,
): Promise<SignedUpload> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKETS.PUBLIC_ASSETS)
    .createSignedUploadUrl(storagePath);
  if (error || !data) {
    throw new Error(
      `Public storage upload URL failed: ${error?.message ?? "unknown error"}`,
    );
  }
  return {
    url: data.signedUrl,
    path: storagePath,
    token: data.token,
  };
}

/** Resolve the permanent public URL for an object in the public bucket. */
export function publicAssetUrl(storagePath: string): string {
  const supabase = createAdminClient();
  const { data } = supabase.storage
    .from(BUCKETS.PUBLIC_ASSETS)
    .getPublicUrl(storagePath);
  return data.publicUrl;
}

/** Remove an object from the public bucket. Idempotent. */
export async function removePublicAsset(storagePath: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.storage.from(BUCKETS.PUBLIC_ASSETS).remove([storagePath]);
}

export { UPLOAD_EXPIRES_IN_SECONDS, DOWNLOAD_EXPIRES_IN_SECONDS };
