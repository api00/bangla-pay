import { createHash, createHmac } from "node:crypto";

const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function rootSecret(): string {
  const secret =
    process.env.ORDER_GRANT_SECRET || process.env.PAYOUT_ENCRYPTION_KEY;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ORDER_GRANT_SECRET (or PAYOUT_ENCRYPTION_KEY) is required in production.",
    );
  }
  return "banglapay-dev-only-library-code";
}

function key(purpose: string): Buffer {
  return createHash("sha256")
    .update(`library:${purpose}:v1:${rootSecret()}`)
    .digest();
}

function codeSuffix(email: string): string {
  const digest = createHmac("sha256", key("code")).update(email).digest();
  let buffer = 0;
  let bits = 0;
  let result = "";
  for (const byte of digest) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5 && result.length < 10) {
      bits -= 5;
      result += CODE_ALPHABET[(buffer >> bits) & 31];
      buffer &= (1 << bits) - 1;
    }
    if (result.length === 10) break;
  }
  return result;
}

/** A readable, stable credential derived from the buyer's normalized email. */
export function libraryCodeForEmail(rawEmail: string): string {
  const email = rawEmail.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("A valid buyer email is required.");
  const prefix =
    email
      .split("@")[0]
      .replace(/[^a-z0-9]/gi, "")
      .toUpperCase()
      .slice(0, 8) || "BUYER";
  const suffix = codeSuffix(email);
  return `${prefix}-${suffix.slice(0, 4)}-${suffix.slice(4, 8)}-${suffix.slice(8)}`;
}

export function normalizeLibraryCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function hashLibraryCode(value: string): string {
  return createHmac("sha256", key("code-hash"))
    .update(normalizeLibraryCode(value))
    .digest("hex");
}

export function signLibrarySession(supporterId: string): string {
  return createHmac("sha256", key("session"))
    .update(supporterId)
    .digest("base64url")
    .slice(0, 32);
}
