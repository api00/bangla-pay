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

/** Remove a stored object — safe to call even if the object is already gone. */
export async function removeStorageObject(storagePath: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.storage.from(BUCKETS.PRODUCT_FILES).remove([storagePath]);
}

export { UPLOAD_EXPIRES_IN_SECONDS, DOWNLOAD_EXPIRES_IN_SECONDS };
