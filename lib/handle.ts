// Creator handle validation + reservation list.
// Handles power public URLs: banglapay.com/{handle}

const HANDLE_REGEX = /^[a-z0-9](?:[a-z0-9_-]{1,29})$/;
const MIN_LENGTH = 2;
const MAX_LENGTH = 30;

/**
 * Reserved handles — must never be claimable.
 * Includes:
 *  - app routes (api, auth, login, signup, dashboard, ...)
 *  - brand & support keywords
 *  - generic Bangladeshi keywords likely to be squatted
 *  - common impersonation targets
 */
export const RESERVED_HANDLES = new Set<string>([
  // app routes
  "api",
  "app",
  "apps",
  "auth",
  "callback",
  "checkout",
  "confirm",
  "dashboard",
  "d",
  "email",
  "favicon",
  "graphql",
  "help",
  "home",
  "icons",
  "images",
  "img",
  "login",
  "logout",
  "magic",
  "messages",
  "new",
  "next",
  "oauth",
  "onboarding",
  "order",
  "orders",
  "page",
  "pages",
  "payments",
  "payout",
  "payouts",
  "press",
  "pricing",
  "privacy",
  "products",
  "public",
  "robots",
  "search",
  "settings",
  "shop",
  "signin",
  "signout",
  "signup",
  "site",
  "sitemap",
  "static",
  "status",
  "supporter",
  "supporters",
  "terms",
  "tip",
  "tips",
  "user",
  "users",
  "webhook",
  "webhooks",
  "well-known",

  // brand & generic
  "about",
  "admin",
  "administrator",
  "banglapay",
  "bangla",
  "bangladesh",
  "blog",
  "brand",
  "career",
  "careers",
  "claim",
  "contact",
  "copyright",
  "creator",
  "creators",
  "discover",
  "docs",
  "explore",
  "feed",
  "following",
  "info",
  "jobs",
  "media",
  "official",
  "owner",
  "platform",
  "post",
  "posts",
  "profile",
  "root",
  "security",
  "service",
  "services",
  "support",
  "team",
  "test",
  "trending",
  "verified",

  // payment rails / brands frequently impersonated
  "bkash",
  "nagad",
  "rocket",
  "sslcommerz",
  "stripe",
  "paypal",
  "wise",
  "buymeacoffee",
  "patreon",
  "kofi",
]);

export interface ValidateHandleResult {
  ok: boolean;
  /** User-facing reason — already non-leaky and copy-ready. */
  reason?: string;
}

/**
 * Lowercase, trim, strip leading "@". Idempotent.
 */
export function normalizeHandle(input: string): string {
  return input.trim().replace(/^@/, "").toLowerCase();
}

/**
 * Validate a handle. Returns `{ ok: true }` if claimable in principle
 * (uniqueness check still required at the DB layer).
 */
export function validateHandle(input: string): ValidateHandleResult {
  if (typeof input !== "string") {
    return { ok: false, reason: "Handle is required." };
  }
  const normalized = normalizeHandle(input);
  if (!normalized) {
    return { ok: false, reason: "Handle is required." };
  }
  if (normalized.length < MIN_LENGTH) {
    return { ok: false, reason: `Handle must be at least ${MIN_LENGTH} characters.` };
  }
  if (normalized.length > MAX_LENGTH) {
    return { ok: false, reason: `Handle must be ${MAX_LENGTH} characters or fewer.` };
  }
  if (!HANDLE_REGEX.test(normalized)) {
    return {
      ok: false,
      reason:
        "Use lowercase letters, numbers, hyphens, or underscores. Must start with a letter or number.",
    };
  }
  if (RESERVED_HANDLES.has(normalized)) {
    return { ok: false, reason: "That handle is reserved. Please pick another." };
  }
  return { ok: true };
}
