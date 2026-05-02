// Bangladesh-specific phone validation. Avoids adding libphonenumber-js while
// MVP is single-country. Accepts:
//   "01712345678", "+8801712345678", "8801712345678"
// Returns canonical E.164 ("+8801712345678") or null.

const BD_LOCAL = /^01[3-9]\d{8}$/;
const BD_E164 = /^\+8801[3-9]\d{8}$/;

export function normalizeBdPhone(input: string): string | null {
  if (typeof input !== "string") return null;
  const cleaned = input.replace(/[\s-]/g, "");
  if (BD_E164.test(cleaned)) return cleaned;
  if (BD_LOCAL.test(cleaned)) return `+88${cleaned}`;
  if (/^8801[3-9]\d{8}$/.test(cleaned)) return `+${cleaned}`;
  return null;
}

/**
 * Mask a normalized E.164 BD number for display:
 *   "+8801712345678" → "+880 17·····5678"
 */
export function maskBdPhone(e164: string): string {
  if (!BD_E164.test(e164)) return e164;
  const local = e164.slice(3); // "01712345678"
  return `+880 ${local.slice(0, 4)}·····${local.slice(-4)}`;
}
