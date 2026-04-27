// All money is stored as integer paisa (1/100 taka). NEVER as float.
// All UI values flow through this file so format/parse is consistent.

const PAISA_PER_TAKA = 100;
const TAKA_FORMATTER = new Intl.NumberFormat("en-BD", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const TAKA_FORMATTER_WITH_PAISA = new Intl.NumberFormat("en-BD", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

function toBengaliNumerals(input: string): string {
  return input.replace(/\d/g, (digit) => BENGALI_DIGITS[Number(digit)]);
}

export interface FormatTakaOptions {
  /** Force showing two decimals (paisa). Default: only when paisa != 0. */
  alwaysShowPaisa?: boolean;
  /** Render digits in Bengali numerals (০-৯). Creator opt-in only. */
  bengaliNumerals?: boolean;
  /** Drop the ৳ symbol (e.g. for input field display). */
  withoutSymbol?: boolean;
}

/**
 * Format an integer paisa amount as a taka display string.
 * Examples:
 *   formatTaka(5000)        → "৳50"
 *   formatTaka(12345)       → "৳123.45"
 *   formatTaka(5000, { bengaliNumerals: true }) → "৳৫০"
 */
export function formatTaka(
  amountPaisa: number,
  options: FormatTakaOptions = {},
): string {
  if (!Number.isFinite(amountPaisa)) {
    throw new Error("formatTaka: amountPaisa must be a finite number");
  }
  if (!Number.isInteger(amountPaisa)) {
    throw new Error("formatTaka: amountPaisa must be an integer (paisa)");
  }

  const isNegative = amountPaisa < 0;
  const absPaisa = Math.abs(amountPaisa);
  const taka = Math.trunc(absPaisa / PAISA_PER_TAKA);
  const paisaRemainder = absPaisa % PAISA_PER_TAKA;
  const showPaisa = options.alwaysShowPaisa || paisaRemainder !== 0;

  const formatter = showPaisa ? TAKA_FORMATTER_WITH_PAISA : TAKA_FORMATTER;
  const numericPart = showPaisa
    ? formatter.format(taka + paisaRemainder / PAISA_PER_TAKA)
    : formatter.format(taka);

  const digits = options.bengaliNumerals
    ? toBengaliNumerals(numericPart)
    : numericPart;

  const symbol = options.withoutSymbol ? "" : "৳";
  const sign = isNegative ? "-" : "";
  return `${sign}${symbol}${digits}`;
}

/**
 * Compact format for charts / dashboards.
 *   formatTakaCompact(150000)    → "৳1.5K"
 *   formatTakaCompact(2500000)   → "৳25K"
 *   formatTakaCompact(150000000) → "৳15L"  (lakh)
 */
export function formatTakaCompact(amountPaisa: number): string {
  const taka = Math.trunc(amountPaisa / PAISA_PER_TAKA);
  if (taka < 1_000) return `৳${taka}`;
  if (taka < 100_000) return `৳${(taka / 1_000).toFixed(taka < 10_000 ? 1 : 0)}K`;
  if (taka < 10_000_000)
    return `৳${(taka / 100_000).toFixed(taka < 1_000_000 ? 1 : 0)}L`;
  return `৳${(taka / 10_000_000).toFixed(1)}Cr`;
}

/**
 * Parse a user-typed taka amount into integer paisa.
 * Accepts: "50", "৳50", "1,234", "1234.56", "১২৩".
 * Returns null on invalid input. NEVER returns negative.
 */
export function parseTakaInput(input: string): number | null {
  if (typeof input !== "string") return null;
  const cleaned = input
    .replace(/[৳,\s]/g, "")
    .replace(
      /[০১২৩৪৫৬৭৮৯]/g,
      (digit) => String(BENGALI_DIGITS.indexOf(digit)),
    )
    .trim();
  if (!cleaned) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const taka = Number.parseFloat(cleaned);
  if (!Number.isFinite(taka) || taka < 0) return null;
  return Math.round(taka * PAISA_PER_TAKA);
}

/** Pure conversions — no formatting. */
export function paisaToTaka(amountPaisa: number): number {
  return amountPaisa / PAISA_PER_TAKA;
}

export function takaToPaisa(amountTaka: number): number {
  return Math.round(amountTaka * PAISA_PER_TAKA);
}
