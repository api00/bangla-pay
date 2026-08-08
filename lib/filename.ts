// Filename helpers shared by upload validation and the quick-start flow.
// Pure string work — no storage or DB concerns belong here.

import { clampText } from "./text";

/**
 * Lowercased extension without the dot, or null when there isn't a usable one.
 *
 * A leading dot (".gitignore") is not an extension, and a trailing dot
 * ("report.") has nothing after it — both return null.
 */
export function fileExtension(filename: string): string | null {
  const normalized = filename.trim().toLowerCase();
  const finalDot = normalized.lastIndexOf(".");
  if (finalDot <= 0 || finalDot >= normalized.length - 1) return null;
  return normalized.slice(finalDot + 1);
}

/** Strip the extension, preserving the original casing of the stem. */
export function filenameStem(filename: string): string {
  const trimmed = filename.trim();
  const extension = fileExtension(trimmed);
  if (!extension) return trimmed;
  return trimmed.slice(0, trimmed.length - extension.length - 1);
}

/**
 * Derive a human title from a filename:
 * "monsoon-stories_vol2.pdf" → "Monsoon Stories Vol2".
 *
 * Only capitalises words that are entirely lowercase, so deliberate casing
 * ("BanglaPay", "iOS") survives. Non-Latin scripts pass through untouched —
 * `toUpperCase` is a no-op on Bangla characters.
 */
export function titleFromFilename(filename: string, maxLength: number): string {
  const words = filenameStem(filename)
    .replace(/[-_.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!words) return "";

  const cased = words
    .split(" ")
    .map((word) =>
      word === word.toLowerCase()
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word,
    )
    .join(" ");

  return clampText(cased, maxLength).trim();
}
