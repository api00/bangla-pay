import "server-only";

import { createHash } from "node:crypto";

import { shortId } from "./ids";

export const MEDIA_ACCESS_TTL_MS = 2 * 60 * 60 * 1000;

export function hashMediaToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createMediaToken(): {
  token: string;
  tokenHash: string;
  expiresAt: Date;
} {
  const token = shortId(24);
  return {
    token,
    tokenHash: hashMediaToken(token),
    expiresAt: new Date(Date.now() + MEDIA_ACCESS_TTL_MS),
  };
}
