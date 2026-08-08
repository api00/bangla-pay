// Text helpers that stay correct outside ASCII.

/**
 * Truncate to `maxLength` without splitting a character apart.
 *
 * `String.prototype.slice` counts UTF-16 code units, so cutting Bangla mid-way
 * can sever a consonant from its vowel sign and leave a dangling mark —
 * "রান্না" becoming "রান্ন" plus an orphaned ◌া. Segmenting first cuts on
 * grapheme boundaries instead.
 *
 * Falls back to a plain slice where `Intl.Segmenter` is unavailable; the
 * result is never longer than asked for either way.
 */
export function clampText(value: string, maxLength: number): string {
  if (maxLength <= 0) return "";
  if (value.length <= maxLength) return value;

  if (typeof Intl === "undefined" || typeof Intl.Segmenter !== "function") {
    return value.slice(0, maxLength);
  }

  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  let out = "";
  for (const { segment } of segmenter.segment(value)) {
    if (out.length + segment.length > maxLength) break;
    out += segment;
  }
  return out;
}
