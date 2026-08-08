import { clampText } from "./text";

// Search tags for a product. One normaliser, used by the manual input and by
// machine-written suggestions alike, so both end up with the same shape.

export const MAX_PRODUCT_TAGS = 8;
export const MAX_TAG_LENGTH = 30;

/**
 * Clean a single tag.
 *
 * Lowercased and whitespace-collapsed, but NOT stripped to ASCII: a Bangla
 * shop needs Bangla tags, and `toLowerCase` is a harmless no-op on Bangla.
 * Only characters that would break a search query are removed.
 */
function normaliseTag(raw: string): string {
  const cleaned = raw
    .replace(/[,\n\r\t]+/g, " ")
    .replace(/["'`<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return clampText(cleaned, MAX_TAG_LENGTH);
}

/**
 * Normalise a list of tags: clean each, drop empties, de-duplicate, and cap
 * the count. Order is preserved so the most relevant tag stays first.
 */
export function normaliseTags(raw: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const candidate of raw) {
    if (typeof candidate !== "string") continue;
    const tag = normaliseTag(candidate);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= MAX_PRODUCT_TAGS) break;
  }
  return out;
}

/** Parse the comma-separated form field into normalised tags. */
export function parseTagsInput(value: string): string[] {
  if (typeof value !== "string" || !value.trim()) return [];
  return normaliseTags(value.split(","));
}

/** Render tags back into the comma-separated form value. */
export function formatTagsInput(tags: readonly string[]): string {
  return tags.join(", ");
}
