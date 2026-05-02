"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";

import {
  clearCover,
  commitCoverUpload,
  signCoverUpload,
} from "@/app/dashboard/shop/_actions/upload-cover";

interface CoverImageUploaderProps {
  productId: string;
  initialUrl: string | null;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export default function CoverImageUploader({
  productId,
  initialUrl,
}: CoverImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();

  async function handlePick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (inputRef.current) inputRef.current.value = "";

    setError(null);

    if (file.size > MAX_BYTES) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
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
        throw new Error("Upload failed mid-flight. Please try again.");
      }

      const result = await commitCoverUpload({
        productId,
        storagePath: signed.storagePath,
      });
      if (!result.ok || !result.publicUrl) {
        throw new Error(result.error ?? "Couldn't save the cover image.");
      }
      // Cache-bust so the new image shows immediately.
      setPreviewUrl(`${result.publicUrl}?v=${Date.now()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function removeCover() {
    if (!confirm("Remove the cover image?")) return;
    setError(null);
    startTransition(async () => {
      const result = await clearCover(productId);
      if (!result.ok) {
        setError(result.error ?? "Couldn't remove the cover image.");
        return;
      }
      setPreviewUrl(null);
    });
  }

  return (
    <div>
      <label className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745] mb-2">
        Cover image
      </label>

      {previewUrl ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="w-full max-w-[420px] aspect-[16/10] rounded-2xl object-cover border border-[rgba(14,15,12,0.06)] bg-[#f2f6ec]"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <label className="inline-flex items-center justify-center h-10 px-4 rounded-full bg-[#0e0f0c] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#163300] transition-colors">
              {uploading ? "Uploading…" : "Replace"}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="sr-only"
                onChange={handlePick}
                disabled={uploading}
              />
            </label>
            <button
              type="button"
              onClick={removeCover}
              disabled={uploading}
              className="inline-flex items-center justify-center h-10 px-4 rounded-full border border-[rgba(14,15,12,0.12)] bg-white text-[#454745] text-[13px] font-semibold hover:border-[#a3221a] hover:text-[#a3221a] transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-[1.5px] border-dashed border-[rgba(14,15,12,0.14)] bg-white px-5 py-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-[13px] text-[#454745] leading-[1.5]">
            JPEG, PNG, WebP, GIF, or AVIF. Up to 5 MB. 16:10 looks best.
          </div>
          <label className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-[#0e0f0c] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#163300] transition-colors">
            {uploading ? "Uploading…" : "Upload image"}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="sr-only"
              onChange={handlePick}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {error && (
        <p className="mt-2 text-[13px] font-medium text-[#da291c]">{error}</p>
      )}
    </div>
  );
}
