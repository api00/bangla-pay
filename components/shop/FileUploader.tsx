"use client";

import {
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";

import { deleteProductFile } from "@/app/dashboard/shop/_actions/delete-file";
import { registerProductFile } from "@/app/dashboard/shop/_actions/register-file";
import { signProductFileUpload } from "@/app/dashboard/shop/_actions/upload-file";
import type { ProductFile } from "@/db/schema";

interface FileUploaderProps {
  productId: string;
  files: ProductFile[];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function FileUploader({
  productId,
  files: initialFiles,
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handlePick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";

    setError(null);
    setUploading(file.name);

    try {
      const signed = await signProductFileUpload({
        productId,
        filename: file.name,
      });
      if (!signed.ok || !signed.url || !signed.storagePath) {
        throw new Error(signed.error ?? "Couldn't get an upload URL.");
      }

      const putResponse = await fetch(signed.url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });
      if (!putResponse.ok) {
        throw new Error("Upload failed mid-flight. Please try again.");
      }

      const result = await registerProductFile({
        productId,
        storagePath: signed.storagePath,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });
      if (!result.ok) throw new Error(result.error ?? "Couldn't save file.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  function removeFile(fileId: string) {
    startTransition(async () => {
      const result = await deleteProductFile({ fileId });
      if (!result.ok) setError(result.error ?? "Couldn't remove file.");
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745] mb-2">
          Product files
        </label>

        <div className="rounded-2xl border-[1.5px] border-dashed border-[rgba(14,15,12,0.14)] bg-white px-5 py-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-[13px] text-[#454745] leading-[1.5]">
            Add the files supporters get when they buy. Max ~50 MB per file.
          </div>
          <label className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-[#163300] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#054d28] transition-colors">
            {uploading ? "Uploading…" : "Add file"}
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              onChange={handlePick}
              disabled={Boolean(uploading)}
            />
          </label>
        </div>
        {error && (
          <p className="mt-2 text-[13px] font-medium text-[#da291c]">{error}</p>
        )}
      </div>

      {initialFiles.length > 0 && (
        <ul className="space-y-2">
          {initialFiles.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgba(14,15,12,0.06)] bg-white"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[#0e0f0c] truncate">
                  {file.filename}
                </p>
                <p className="text-[12px] text-[#868685]">
                  {file.mimeType} · {formatBytes(file.sizeBytes)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="text-[12px] font-semibold text-[#da291c] hover:underline underline-offset-4 px-2 py-1"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
