"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";

import {
  commitCoverUpload,
  removeGalleryImage,
  setPrimaryImage,
  signCoverUpload,
} from "@/app/dashboard/shop/_actions/upload-cover";

interface ProductImagesUploaderProps {
  productId: string;
  initialUrls: string[];
}

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_GALLERY = 8;

interface PendingUpload {
  id: string;
  name: string;
  previewUrl: string;
  status: "uploading" | "error";
  error?: string;
}

export default function ProductImagesUploader({
  productId,
  initialUrls,
}: ProductImagesUploaderProps) {
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [urls, setUrls] = useState<string[]>(initialUrls);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const remainingSlots = Math.max(MAX_GALLERY - urls.length - pending.length, 0);

  /** Upload one file. Returns the resolved public URL on success, null on failure. */
  async function uploadOne(file: File): Promise<string | null> {
    const id = crypto.randomUUID();
    const localPreview = URL.createObjectURL(file);
    setPending((prev) => [
      ...prev,
      { id, name: file.name, previewUrl: localPreview, status: "uploading" },
    ]);

    try {
      if (file.size > MAX_BYTES) {
        throw new Error(`${file.name}: must be 5 MB or smaller.`);
      }
      const signed = await signCoverUpload({
        productId,
        filename: file.name,
        mimeType: file.type,
      });
      if (!signed.ok || !signed.url || !signed.storagePath) {
        throw new Error(signed.error ?? "Couldn't get an upload URL.");
      }
      const putResponse = await fetch(signed.url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "x-upsert": "true",
        },
        body: file,
      });
      if (!putResponse.ok) {
        throw new Error("Upload failed mid-flight.");
      }
      const result = await commitCoverUpload({
        productId,
        storagePath: signed.storagePath,
      });
      if (!result.ok || !result.publicUrl) {
        throw new Error(result.error ?? "Couldn't save image.");
      }
      setUrls(
        result.galleryUrls && result.galleryUrls.length > 0
          ? result.galleryUrls
          : [result.publicUrl as string],
      );
      setPending((prev) => prev.filter((p) => p.id !== id));
      URL.revokeObjectURL(localPreview);
      return result.publicUrl as string;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setPending((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: "error", error: message } : p,
        ),
      );
      URL.revokeObjectURL(localPreview);
      return null;
    }
  }

  async function handleCoverPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (coverInputRef.current) coverInputRef.current.value = "";
    if (!file) return;
    setBulkError(null);

    const previousCover = urls[0];
    const newUrl = await uploadOne(file);
    if (!newUrl) return;

    // Replace flow: promote the new upload to cover and drop the old image.
    if (previousCover && previousCover !== newUrl) {
      const promote = await setPrimaryImage({ productId, url: newUrl });
      if (promote.ok && promote.galleryUrls) setUrls(promote.galleryUrls);
      const removed = await removeGalleryImage({
        productId,
        url: previousCover,
      });
      if (removed.ok && removed.galleryUrls) setUrls(removed.galleryUrls);
    }
  }

  async function handleGalleryPick(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    if (files.length === 0) return;
    setBulkError(null);
    const slots = Math.max(MAX_GALLERY - urls.length - pending.length, 0);
    const accepted = files.slice(0, slots);
    if (files.length > slots) {
      setBulkError(`Only ${slots} more image${slots === 1 ? "" : "s"} allowed.`);
    }
    await Promise.all(accepted.map((file) => uploadOne(file)));
  }

  function dismissPending(id: string) {
    setPending((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  function removeAt(url: string) {
    if (!confirm("Remove this image?")) return;
    setBulkError(null);
    startTransition(async () => {
      const before = urls;
      setUrls((current) => current.filter((u) => u !== url));
      const result = await removeGalleryImage({ productId, url });
      if (!result.ok) {
        setBulkError(result.error ?? "Couldn't remove image.");
        setUrls(before);
        return;
      }
      if (result.galleryUrls) setUrls(result.galleryUrls);
    });
  }

  function makeCover(url: string) {
    setBulkError(null);
    startTransition(async () => {
      const result = await setPrimaryImage({ productId, url });
      if (!result.ok) {
        setBulkError(result.error ?? "Couldn't set cover.");
        return;
      }
      if (result.galleryUrls) setUrls(result.galleryUrls);
    });
  }

  const cover = urls[0];
  const rest = urls.slice(1);
  const galleryPending = pending; // all pending uploads animate in the gallery row

  return (
    <div className="space-y-7">
      {/* COVER IMAGE — distinct, primary slot */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745]">
            Cover image
          </label>
          <span className="text-[11px] text-[#868685]">
            Shown everywhere your product appears
          </span>
        </div>

        {cover ? (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${cover}?v=${urls.length}`}
              alt=""
              className="w-full max-w-[480px] aspect-[16/10] rounded-2xl object-cover border border-[rgba(14,15,12,0.06)] bg-[#f2f6ec]"
            />
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <label className="inline-flex items-center justify-center h-10 px-4 rounded-full bg-[#0e0f0c] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#163300] transition-colors">
                Replace cover
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="sr-only"
                  onChange={handleCoverPick}
                />
              </label>
              <button
                type="button"
                onClick={() => removeAt(cover)}
                className="inline-flex items-center justify-center h-10 px-4 rounded-full border border-[rgba(14,15,12,0.12)] bg-white text-[#454745] text-[13px] font-semibold hover:border-[#a3221a] hover:text-[#a3221a] transition-colors"
              >
                Remove
              </button>
              <span className="text-[12px] text-[#163300] font-semibold ml-1">
                ✓ Saved
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-[1.5px] border-dashed border-[rgba(14,15,12,0.14)] bg-white px-5 py-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-[13px] text-[#454745] leading-[1.5]">
              The hero image for your product. JPEG, PNG, WebP, GIF, AVIF —
              up to 5 MB. 16:10 looks best.
            </div>
            <label className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-[#9fe870] text-[#163300] text-[13px] font-semibold cursor-pointer hover:bg-[#cdffad] transition-colors shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_8px_22px_-12px_rgba(159,232,112,0.7)]">
              Upload cover
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="sr-only"
                onChange={handleCoverPick}
              />
            </label>
          </div>
        )}
      </div>

      {/* ADDITIONAL IMAGES — secondary, multi */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745]">
            Additional images
          </label>
          <span className="text-[11px] tabular-nums text-[#868685]">
            {rest.length + galleryPending.length}/{MAX_GALLERY - 1}
          </span>
        </div>

        {(rest.length > 0 || galleryPending.length > 0) && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {rest.map((url) => (
              <div key={url} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="w-full aspect-square rounded-xl object-cover border border-[rgba(14,15,12,0.06)] bg-[#f2f6ec]"
                />
                <div className="absolute inset-0 bg-[rgba(14,15,12,0.55)] opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-1.5 p-2">
                  <button
                    type="button"
                    onClick={() => makeCover(url)}
                    className="text-[11px] font-semibold text-[#163300] bg-[#9fe870] hover:bg-[#cdffad] h-7 px-3 rounded-full transition-colors"
                  >
                    Make cover
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAt(url)}
                    className="text-[11px] font-semibold text-white hover:text-[#fde2df] h-7 px-3 rounded-full"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {galleryPending.map((p) => (
              <div
                key={p.id}
                className="relative aspect-square rounded-xl overflow-hidden border border-[rgba(14,15,12,0.06)] bg-[#f2f6ec]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.previewUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                {p.status === "uploading" ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-[11px] font-semibold text-[#163300] bg-white/90 px-2 py-1 rounded-full">
                      Uploading…
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => dismissPending(p.id)}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[rgba(218,41,28,0.85)] text-white text-[10px] font-semibold p-1 text-center"
                    title={p.error}
                  >
                    <span>Failed</span>
                    <span className="opacity-80 line-clamp-2">{p.error}</span>
                    <span className="underline">dismiss</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {remainingSlots > 0 && (
          <div className="rounded-2xl border-[1.5px] border-dashed border-[rgba(14,15,12,0.14)] bg-white px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-[13px] text-[#454745] leading-[1.5]">
              {rest.length === 0
                ? "Show extra angles, samples, or detail shots."
                : `Add up to ${remainingSlots} more.`}
            </div>
            <label className="inline-flex items-center justify-center h-10 px-4 rounded-full bg-white border border-[rgba(14,15,12,0.12)] text-[#0e0f0c] text-[13px] font-semibold cursor-pointer hover:border-[#0e0f0c] transition-colors">
              {rest.length === 0 || galleryPending.length === 0
                ? "Add images"
                : "Add more"}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                multiple
                className="sr-only"
                onChange={handleGalleryPick}
              />
            </label>
          </div>
        )}
      </div>

      {bulkError && (
        <p className="text-[13px] font-medium text-[#da291c]">{bulkError}</p>
      )}

      <p className="text-[12px] text-[#868685] leading-[1.55]">
        Images upload and save automatically — no need to click any other
        save button.
      </p>
    </div>
  );
}
