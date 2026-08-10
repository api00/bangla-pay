"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

import { createProductDraftShell } from "@/app/dashboard/shop/_actions/create-draft-shell";
import { registerProductFile } from "@/app/dashboard/shop/_actions/register-file";
import { signProductFileUpload } from "@/app/dashboard/shop/_actions/upload-file";
import { useToast } from "@/components/ui/Toast";
import type { ProductFile } from "@/db/schema";
import {
  QUICK_START_ACCEPT,
  type DeliveryMode,
  type ProductCategory,
} from "@/lib/product-catalog";

export interface QuickStartResult {
  productId: string;
  category: ProductCategory;
  deliveryMode: DeliveryMode;
  title: string;
  slug: string;
  file: ProductFile;
}

interface QuickStartDropzoneProps {
  onReady: (result: QuickStartResult) => void;
  disabled?: boolean;
}

/**
 * Optional first move in the wizard: drop the product file and let the fields
 * below fill themselves in. Skipping it and typing everything by hand is a
 * fully supported path — nothing downstream requires this to have run.
 */
export default function QuickStartDropzone({
  onReady,
  disabled = false,
}: QuickStartDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locked = disabled || Boolean(busy);

  async function handleFile(file: File) {
    setError(null);
    setBusy(file.name);

    const mimeType = file.type || "application/octet-stream";

    try {
      // 1. Create the row, deriving category and delivery mode from the file.
      const draft = await createProductDraftShell({
        filename: file.name,
        mimeType,
        sizeBytes: file.size,
      });
      if (
        !draft.ok ||
        !draft.productId ||
        !draft.category ||
        !draft.deliveryMode
      ) {
        throw new Error(draft.error ?? "Couldn't read that file.");
      }

      // 2. Upload straight to Storage through the same signed-URL path the
      //    rest of the shop uses.
      const signed = await signProductFileUpload({
        productId: draft.productId,
        filename: file.name,
        mimeType,
        sizeBytes: file.size,
      });
      if (!signed.ok || !signed.url || !signed.storagePath) {
        throw new Error(signed.error ?? "Couldn't get an upload URL.");
      }

      const putResponse = await fetch(signed.url, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: file,
      });
      if (!putResponse.ok) {
        throw new Error("Upload failed mid-flight. Please try again.");
      }

      // 3. Record it, so step 2 shows the file already attached.
      const registered = await registerProductFile({
        productId: draft.productId,
        storagePath: signed.storagePath,
        filename: file.name,
        mimeType,
        sizeBytes: file.size,
      });
      if (!registered.ok || !registered.file) {
        throw new Error(registered.error ?? "Couldn't save the file.");
      }

      onReady({
        productId: draft.productId,
        category: draft.category,
        deliveryMode: draft.deliveryMode,
        title: draft.title ?? "",
        slug: draft.slug ?? "",
        file: registered.file,
      });
      toast.success(`${file.name} added — check the details below`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Couldn't read that file.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(null);
    }
  }

  function handlePick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (file) void handleFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (locked) return;
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!locked) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          "rounded-medium border-[1.5px] border-dashed px-5 py-7 text-center transition-colors",
          dragging
            ? "border-dark-green bg-light-mint"
            : "border-[rgba(14,15,12,0.14)] bg-off-white",
          locked ? "opacity-70" : "",
        ].join(" ")}
      >
        <p className="text-[15px] font-semibold text-near-black">
          {busy ? `Reading ${busy}…` : "Drop your product file here"}
        </p>
        <p className="mx-auto mt-1 max-w-[38ch] text-[13px] leading-[1.55] text-warm-dark">
          We&rsquo;ll work out the category and title for supported shop files.
          PDFs and images up to 12 MB can also draft your listing copy.
        </p>

        <label
          className={[
            "mt-4 inline-flex h-11 items-center justify-center rounded-pill bg-dark-green px-5 text-[13px] font-semibold text-white transition-colors",
            locked ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-positive",
          ].join(" ")}
        >
          {busy ? "Working…" : "Choose a file"}
          <input
            ref={inputRef}
            type="file"
            accept={QUICK_START_ACCEPT}
            className="sr-only"
            onChange={handlePick}
            disabled={locked}
          />
        </label>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-2 text-[13px] font-medium text-heritage-red-ink"
        >
          {error}
        </p>
      )}

      <p className="mt-4 text-center text-[13px] text-gray">
        or fill everything in yourself below
      </p>
    </div>
  );
}
