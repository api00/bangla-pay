import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Browser-scoped proof that "this browser completed this checkout".
//
// Why this exists: the checkout email is typed, not verified. Gating the
// library purely on `logged-in email === supporter_email` locks a buyer out of
// something they just paid for whenever those differ — which is the common
// case, since supporters are not required to have an account at all.
//
// So access is granted two ways:
//   1. this cookie, set the moment the order is marked paid, or
//   2. being signed in with the email used at checkout (durable, cross-device).
//
// The cookie stores `orderId.hmac` pairs. The HMAC means a visitor cannot mint
// a grant for an order they did not buy by editing the cookie — the value is
// only trusted if it verifies against a server-side secret.
//
// Deliberate trade-off: anyone sharing the browser can reopen the purchase.
// That matches how receipt links behave elsewhere and is the price of not
// forcing an OTP before every purchase.

const COOKIE_NAME = "bp_order_grants";
const MAX_GRANTS = 25;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 days

/**
 * Key for grant signatures.
 *
 * Prefers a dedicated ORDER_GRANT_SECRET. Falls back to the already-deployed
 * PAYOUT_ENCRYPTION_KEY with a distinct domain-separation prefix, so adding
 * this feature does not require a new production env var to be set first.
 * Reusing the key is safe here precisely because the prefix guarantees these
 * HMACs can never collide with any other use of that key.
 */
function grantKey(): Buffer {
  const raw =
    process.env.ORDER_GRANT_SECRET || process.env.PAYOUT_ENCRYPTION_KEY;
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "ORDER_GRANT_SECRET (or PAYOUT_ENCRYPTION_KEY) is required in production.",
      );
    }
    return createHash("sha256")
      .update("banglapay-dev-only-order-grant")
      .digest();
  }
  return createHash("sha256").update(`order-grant:v1:${raw}`).digest();
}

function sign(orderId: string): string {
  return createHmac("sha256", grantKey())
    .update(orderId)
    .digest("base64url")
    .slice(0, 32);
}

function verify(orderId: string, signature: string): boolean {
  const expected = Buffer.from(sign(orderId));
  const given = Buffer.from(signature);
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

function parse(raw: string | undefined): string[] {
  if (!raw) return [];
  const ids: string[] = [];
  for (const entry of raw.split(",")) {
    const [orderId, signature] = entry.split(".");
    if (!orderId || !signature) continue;
    if (verify(orderId, signature)) ids.push(orderId);
  }
  return ids;
}

/** Order IDs this browser is allowed to open without signing in. */
export async function readOrderGrants(): Promise<string[]> {
  const store = await cookies();
  return parse(store.get(COOKIE_NAME)?.value);
}

export async function hasOrderGrant(orderId: string): Promise<boolean> {
  return (await readOrderGrants()).includes(orderId);
}

/**
 * Record that this browser completed `orderId`.
 *
 * Callable only from a Server Action or Route Handler — Server Components
 * cannot set cookies. Failures are swallowed so a cookie problem can never
 * block an otherwise successful payment; the buyer just has to sign in.
 */
export async function grantOrderAccess(orderId: string): Promise<void> {
  try {
    const store = await cookies();
    const existing = parse(store.get(COOKIE_NAME)?.value).filter(
      (id) => id !== orderId,
    );
    const next = [orderId, ...existing].slice(0, MAX_GRANTS);

    store.set(
      COOKIE_NAME,
      next.map((id) => `${id}.${sign(id)}`).join(","),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: MAX_AGE_SECONDS,
      },
    );
  } catch {
    // Non-fatal: the email-match path still works.
  }
}
