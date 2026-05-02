"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";

import {
  clearCreatorImage,
  commitCreatorImage,
  signCreatorImageUpload,
  type CreatorImageKind,
} from "@/app/dashboard/settings/profile/_image-actions";

interface CreatorImageUploaderProps {
  kind: CreatorImageKind;
  label: string;
  hint: string;
  /** "square" or "wide" — controls preview aspect ratio. */
  shape: "square" | "wide";
  initialUrl: string | null;
}

const MAX_BYTES = 5 * 1024 * 1024;

export default function CreatorImageUploader({
  kind,
  label,
  hint,
  shape,
  initialUrl,
}: CreatorImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();

  async function handlePick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;

    setError(null);
    if (file.size > MAX_BYTES) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const signed = await signCreatorImageUpload({
        kind,
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
      if (!putResponse.ok) throw new Error("Upload failed mid-flight.");

      const result = await commitCreatorImage({
        kind,
        storagePath: signed.storagePath,
      });
      if (!result.ok || !result.publicUrl) {
        throw new Error(result.error ?? "Couldn't save image.");
      }
      setPreviewUrl(`${result.publicUrl}?v=${Date.now()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    if (!confirm(`Remove your ${kind}?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await clearCreatorImage(kind);
      if (!result.ok) {
        setError(result.error ?? "Couldn't remove image.");
        return;
      }
      setPreviewUrl(null);
    });
  }

  const aspect = shape === "square" ? "aspect-square" : "aspect-[3/1]";
  const previewMaxWidth = shape === "square" ? "max-w-[180px]" : "max-w-[480px]";
  const rounded = shape === "square" ? "rounded-full" : "rounded-2xl";

  return (
    <div>
      <label className="block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#454745] mb-2">
        {label}
      </label>

      {previewUrl ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className={`w-full ${previewMaxWidth} ${aspect} ${rounded} object-cover border border-[rgba(14,15,12,0.06)] bg-[#f2f6ec]`}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <label className="inline-flex items-center justify-center h-9 px-4 rounded-full bg-[#163300] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#054d28] transition-colors">
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
              onClick={removeImage}
              disabled={uploading}
              className="inline-flex items-center justify-center h-9 px-4 rounded-full border border-[rgba(14,15,12,0.12)] bg-white text-[#454745] text-[13px] font-semibold hover:border-[#a3221a] hover:text-[#a3221a] transition-colors disabled:opacity-50"
            >
              Remove
            </button>
            <span className="text-[12px] text-[#163300] font-semibold ml-1">
              ✓ Saved
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-[1.5px] border-dashed border-[rgba(14,15,12,0.14)] bg-white px-5 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-[13px] text-[#454745] leading-[1.5]">{hint}</div>
          <label className="inline-flex items-center justify-center h-10 px-4 rounded-full bg-[#163300] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#054d28] transition-colors">
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
        <p className="mt-2 text-[12px] font-medium text-[#a3221a]">{error}</p>
      )}
    </div>
  );
}
