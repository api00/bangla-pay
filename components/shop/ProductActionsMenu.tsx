"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { deleteProduct } from "@/app/dashboard/shop/_actions/delete-product";
import { useToast } from "@/components/ui/Toast";
import { creatorUrl } from "@/lib/site";

interface ProductActionsMenuProps {
  productId: string;
  handle: string;
  slug: string;
  isPublished: boolean;
}

export default function ProductActionsMenu({
  productId,
  handle,
  slug,
  isPublished,
}: ProductActionsMenuProps) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  const publicUrl = `${creatorUrl(handle)}/shop/${slug}`;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setConfirming(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link — copy it from the address bar.");
    }
    setOpen(false);
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteProduct({ productId });
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't delete.");
        setConfirming(false);
        setOpen(false);
        return;
      }
      toast.success(
        result.archived
          ? "Removed from your shop. Buyers keep the copy they paid for."
          : "Product deleted",
      );
      setOpen(false);
      // revalidatePath alone does not repaint this client tree — without the
      // refresh the deleted card stays on screen and delete looks broken.
      router.refresh();
    });
  }

  const itemClass =
    "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-semibold text-[#0e0f0c] transition-colors hover:bg-[#f7f9f5]";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Product actions"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(14,15,12,0.12)] bg-white text-[#454745] transition-colors hover:border-[#0e0f0c] hover:text-[#0e0f0c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
          <circle cx="4" cy="10" r="1.6" />
          <circle cx="10" cy="10" r="1.6" />
          <circle cx="16" cy="10" r="1.6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-30 w-[210px] overflow-hidden rounded-2xl border border-[rgba(14,15,12,0.1)] bg-white py-1 shadow-[0_20px_50px_-20px_rgba(14,15,12,0.35)]"
        >
          {confirming ? (
            <div className="px-3 py-2">
              <p className="text-[13px] font-semibold leading-[1.4] text-[#0e0f0c]">
                Delete this product?
              </p>
              <p className="mt-1 text-[12px] leading-[1.45] text-[#454745]">
                It leaves your shop for good. Anyone who already bought it
                keeps their access.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={pending}
                  className="inline-flex h-8 items-center rounded-full bg-[#da291c] px-3 text-[12px] font-semibold text-white disabled:opacity-60"
                >
                  {pending ? "Deleting…" : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="text-[12px] font-semibold text-[#454745] hover:text-[#0e0f0c]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button type="button" role="menuitem" onClick={copyLink} className={itemClass}>
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden>
                  <path
                    d="M8.5 11.5a3 3 0 0 0 4.24 0l2-2a3 3 0 1 0-4.24-4.24l-.7.7M11.5 8.5a3 3 0 0 0-4.24 0l-2 2a3 3 0 1 0 4.24 4.24l.7-.7"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                Copy link
              </button>

              <Link
                role="menuitem"
                href={`/${handle}/shop/${slug}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className={itemClass}
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden>
                  <path
                    d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3M12 3h5v5M17 3l-7 7"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {isPublished ? "View live page" : "Preview page"}
              </Link>

              <Link
                role="menuitem"
                href={`/dashboard/shop/${productId}/edit`}
                onClick={() => setOpen(false)}
                className={itemClass}
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden>
                  <path
                    d="m4 16 .8-3.2L12.6 5a1.4 1.4 0 0 1 2 0l.4.4a1.4 1.4 0 0 1 0 2l-7.8 7.8L4 16Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
                Edit product
              </Link>

              <div className="my-1 h-px bg-[rgba(14,15,12,0.08)]" />

              <button
                type="button"
                role="menuitem"
                onClick={() => setConfirming(true)}
                className={`${itemClass} text-[#da291c] hover:bg-[#fde2df]`}
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden>
                  <path
                    d="M4 6h12M8 6V4.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V6m3 0-.6 9a1 1 0 0 1-1 .9H6.1a1 1 0 0 1-1-.9L4.5 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
