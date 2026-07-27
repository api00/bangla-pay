"use client";

import {
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";

import { deleteProductFile } from "@/app/dashboard/shop/_actions/delete-file";
import { registerProductFile } from "@/app/dashboard/shop/_actions/register-file";
import { useToast } from "@/components/ui/Toast";
import { signProductFileUpload } from "@/app/dashboard/shop/_actions/upload-file";
import type { ProductFile } from "@/db/schema";
import {
  getDeliveryFileGuidance,
  getProductCategory,
  type DeliveryMode,
  type ProductCategory,
  validateDeliveryFile,
} from "@/lib/product-catalog";

interface FileUploaderProps {
  productId: string;
  files: ProductFile[];
  productCategory: ProductCategory | null;
  deliveryMode: DeliveryMode;
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
  productCategory,
  deliveryMode,
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Files attached during this session. The wizard renders before any server
  // round-trip, so without this an upload would leave the list looking empty.
  const [added, setAdded] = useState<ProductFile[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const visibleFiles = [
    ...initialFiles,
    ...added.filter(
      (extra) => !initialFiles.some((file) => file.id === extra.id),
    ),
  ].filter((file) => !removedIds.includes(file.id));

  async function handlePick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";

    setError(null);
    setNotice(null);
    if (!productCategory) {
      setError("Choose a product category and save Details before uploading.");
      return;
    }

    const mimeType = file.type || "application/octet-stream";
    const validationError = validateDeliveryFile({
      category: productCategory,
      deliveryMode,
      filename: file.name,
      mimeType,
      sizeBytes: file.size,
    });
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setUploading(file.name);

    try {
      const signed = await signProductFileUpload({
        productId,
        filename: file.name,
        mimeType,
        sizeBytes: file.size,
      });
      if (!signed.ok || !signed.url || !signed.storagePath) {
        throw new Error(signed.error ?? "Couldn't get an upload URL.");
      }

      const putResponse = await fetch(signed.url, {
        method: "PUT",
        headers: {
          "Content-Type": mimeType,
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
        mimeType,
        sizeBytes: file.size,
      });
      if (!result.ok) throw new Error(result.error ?? "Couldn't save file.");
      if (result.file) setAdded((prev) => [...prev, result.file as ProductFile]);
      toast.success(`${file.name} added`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(null);
    }
  }

  function removeFile(fileId: string) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await deleteProductFile({ fileId });
      if (!result.ok) {
        const message = result.error ?? "Couldn't remove file.";
        setError(message);
        toast.error(message);
        return;
      }
      setRemovedIds((prev) => [...prev, fileId]);
      setAdded((prev) => prev.filter((file) => file.id !== fileId));
      if (result.unpublished) {
        const message =
          "Product moved to draft — a published product needs at least one file.";
        setNotice(message);
        toast.info(message);
      } else {
        toast.success("File removed");
      }
    });
  }

  const category = getProductCategory(productCategory);
  const guidance = productCategory
    ? getDeliveryFileGuidance(productCategory, deliveryMode)
    : null;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-warm-dark mb-2">
          Product files
        </label>

        <div className="rounded-2xl border-[1.5px] border-dashed border-[rgba(14,15,12,0.14)] bg-white px-5 py-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-[13px] text-warm-dark leading-[1.5]">
            {category
              ? `${category.label}: ${guidance?.formats}. Maximum 50 MB per file.`
              : "Choose a category in Details before adding product files."}
          </div>
          <label
            className={[
              "inline-flex h-11 items-center justify-center rounded-full bg-dark-green px-5 text-[13px] font-semibold text-white transition-colors",
              productCategory
                ? "cursor-pointer hover:bg-positive"
                : "cursor-not-allowed opacity-50",
            ].join(" ")}
          >
            {uploading ? "Uploading…" : "Add file"}
            <input
              ref={fileInputRef}
              type="file"
              accept={guidance?.accept}
              className="sr-only"
              onChange={handlePick}
              disabled={Boolean(uploading) || !productCategory}
            />
          </label>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-2 text-[13px] font-medium text-heritage-red"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mt-2 text-[13px] font-medium text-dark-green"
          >
            {notice}
          </p>
        )}
      </div>

      {visibleFiles.length > 0 && (
        <ul className="space-y-2">
          {visibleFiles.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgba(14,15,12,0.06)] bg-white"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-near-black truncate">
                  {file.filename}
                </p>
                <p className="text-[12px] text-gray">
                  {file.mimeType} · {formatBytes(file.sizeBytes)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="inline-flex h-11 items-center px-2 text-[12px] font-semibold text-heritage-red underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heritage-red"
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
