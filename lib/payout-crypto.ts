import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

// AES-256-GCM envelope for payout method details.
//
// Why this lives here:
// - Payout details (bKash MSISDN, bank account #) must never be stored in
//   plaintext. The schema column is `bytea`.
// - We don't yet wire pgsodium / Supabase Vault — that's a Phase 9 hardening
//   step. This module gives us a real encryption-at-rest layer using a
//   server-only key, so the v1 launch isn't shipping account numbers in clear.
//
// Format on disk: [12-byte IV][16-byte auth tag][ciphertext]
//
// Key derivation: SHA-256 of process.env.PAYOUT_ENCRYPTION_KEY, so the env
// var can be any length. Throws at boot if missing in production.

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;

function getKey(): Buffer {
  const raw = process.env.PAYOUT_ENCRYPTION_KEY;
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "PAYOUT_ENCRYPTION_KEY is required in production. Generate with: openssl rand -base64 32",
      );
    }
    // Dev fallback — deterministic so existing rows still decrypt locally.
    return createHash("sha256").update("banglapay-dev-only-key").digest();
  }
  return createHash("sha256").update(raw).digest();
}

export function encryptPayoutDetails(plaintext: string): Buffer {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

export function decryptPayoutDetails(payload: Buffer): string {
  if (payload.length < IV_BYTES + TAG_BYTES) {
    throw new Error("Encrypted payload is too short.");
  }
  const iv = payload.subarray(0, IV_BYTES);
  const tag = payload.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = payload.subarray(IV_BYTES + TAG_BYTES);
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export interface PayoutDetailsBkash {
  type: "bkash" | "nagad" | "rocket";
  msisdn: string; // "+8801712345678"
}

export interface PayoutDetailsBank {
  type: "beftn" | "rtgs";
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  routingNumber: string; // 9 digits
}

export type PayoutDetails = PayoutDetailsBkash | PayoutDetailsBank;

export function encodePayoutDetails(details: PayoutDetails): Buffer {
  return encryptPayoutDetails(JSON.stringify(details));
}

export function decodePayoutDetails(payload: Buffer): PayoutDetails {
  return JSON.parse(decryptPayoutDetails(payload)) as PayoutDetails;
}
