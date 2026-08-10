import "server-only";

import { timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import { supporters } from "@/db/schema";
import {
  hashLibraryCode,
  libraryCodeForEmail,
  normalizeLibraryCode,
  signLibrarySession,
} from "@/lib/library-code-core";

export { libraryCodeForEmail } from "@/lib/library-code-core";

const COOKIE_NAME = "bp_library_grant";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

export async function ensureLibraryCodeForSupporter(
  supporterId: string,
): Promise<string> {
  const [supporter] = await db
    .select({
      email: supporters.email,
      libraryCodeHash: supporters.libraryCodeHash,
    })
    .from(supporters)
    .where(eq(supporters.id, supporterId))
    .limit(1);
  if (!supporter) throw new Error("Supporter not found.");

  const code = libraryCodeForEmail(supporter.email);
  const codeHash = hashLibraryCode(code);
  if (supporter.libraryCodeHash !== codeHash) {
    await db
      .update(supporters)
      .set({ libraryCodeHash: codeHash })
      .where(eq(supporters.id, supporterId));
  }
  return code;
}

export async function findSupporterByLibraryCode(value: string): Promise<{
  id: string;
  email: string;
} | null> {
  const compact = normalizeLibraryCode(value);
  if (compact.length < 11 || compact.length > 18) return null;

  const [supporter] = await db
    .select({ id: supporters.id, email: supporters.email })
    .from(supporters)
    .where(eq(supporters.libraryCodeHash, hashLibraryCode(compact)))
    .limit(1);
  return supporter ?? null;
}

function validSignature(supporterId: string, signature: string): boolean {
  const expected = Buffer.from(signLibrarySession(supporterId));
  const received = Buffer.from(signature);
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export async function readLibrarySupporterGrant(): Promise<string | null> {
  const store = await cookies();
  const [supporterId, signature] =
    store.get(COOKIE_NAME)?.value.split(".") ?? [];
  if (!supporterId || !signature || !validSignature(supporterId, signature)) {
    return null;
  }
  return supporterId;
}

export async function grantLibraryAccess(supporterId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, `${supporterId}.${signLibrarySession(supporterId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearLibraryAccess(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
