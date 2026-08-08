"use client";

import { useMemo, useState } from "react";

import {
  MAX_PRODUCT_TAGS,
  parseTagsInput,
} from "@/lib/product-tags";

interface TagsFieldProps {
  /** Controlled value. Omit to let the field hold its own state. */
  value?: string;
  /** Starting value when uncontrolled — the plain-form case. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Set when the field posts as part of a plain <form>. */
  name?: string;
  /** Marks the value as machine-written until the creator edits it. */
  suggested?: boolean;
}

const labelClass =
  "text-[12px] font-semibold uppercase tracking-[0.18em] text-warm-dark";

/**
 * Comma-separated tag entry with a live preview of what will be saved.
 *
 * The preview runs the same normaliser as the server, so what the creator
 * sees is exactly what gets stored — lowercased, de-duplicated, and capped.
 */
export default function TagsField({
  value,
  defaultValue = "",
  onChange,
  name = "tags",
  suggested = false,
}: TagsFieldProps) {
  // Controlled when the parent owns the value (the wizard), self-managed when
  // it posts as part of a plain form (the edit screen).
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  function handleChange(next: string) {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  }

  const parsed = useMemo(() => parseTagsInput(current), [current]);
  const overflowed = useMemo(
    () =>
      current.split(",").filter((part) => part.trim()).length >
      MAX_PRODUCT_TAGS,
    [current],
  );

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <label htmlFor="tags" className={labelClass}>
          Search tags
        </label>
        {suggested && (
          <span className="inline-flex items-center rounded-pill bg-mint-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-warm-dark">
            From your file
          </span>
        )}
      </div>

      <input
        id="tags"
        name={name}
        type="text"
        value={current}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="recipes, bangla, cooking"
        aria-describedby="tags-help"
        className="h-12 w-full rounded-2xl border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-4 text-[16px] font-medium text-near-black outline-none transition-colors placeholder:text-gray-ink focus-visible:border-dark-green focus-visible:ring-2 focus-visible:ring-wise-green"
      />

      <p id="tags-help" className="mt-2 text-[13px] text-warm-dark">
        Separate with commas. Up to {MAX_PRODUCT_TAGS}; these help supporters
        find this product.
      </p>

      {parsed.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {parsed.map((tag) => (
            <li
              key={tag}
              className="inline-flex min-h-7 items-center rounded-pill border border-[rgba(14,15,12,0.1)] bg-off-white px-3 text-[12px] font-semibold text-warm-dark"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {overflowed && (
        <p role="status" className="mt-2 text-[12px] text-warning-ink">
          Only the first {MAX_PRODUCT_TAGS} will be saved.
        </p>
      )}
    </div>
  );
}
