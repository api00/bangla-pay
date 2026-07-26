import { randomBytes } from "node:crypto";

// Short, URL-safe, unguessable id. Used for download tokens, internal short
// references, etc. Default 24 bytes → 32 base64url characters → ~144 bits of
// entropy. Never use for primary keys (use UUID v4 from Postgres for those).

export function shortId(byteLength = 24): string {
  return randomBytes(byteLength)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Human-readable receipt code. Buyer authorization still requires login. */
export function createOrderCode(): string {
  return `BP-${randomBytes(6).toString("hex").toUpperCase()}`;
}
