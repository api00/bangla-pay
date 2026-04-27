// Slugify a title into a URL-safe segment.
// Conservative — falls back to a random suffix if the title produces an empty result.
import { shortId } from "./ids";

const MAX_LENGTH = 64;

export function slugify(input: string): string {
  const base = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_LENGTH);
  if (!base) return shortId(8).toLowerCase();
  return base;
}

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

export function isValidSlug(input: string): boolean {
  return SLUG_REGEX.test(input);
}
