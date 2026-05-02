// Single source of truth for the site's public origin.
//
// Override at deploy time with NEXT_PUBLIC_SITE_URL when the domain changes.
// Examples:
//   - production today:  https://bangla-pay-nine.vercel.app
//   - preview deploys:   https://bangla-pay-nine-git-<branch>.vercel.app
//   - eventual custom:   https://banglapay.com
//
// Keep no trailing slash. Helpers below add the slash for you.

const FALLBACK_ORIGIN = "https://bangla-pay-nine.vercel.app";

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export const SITE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_ORIGIN,
);

/** Bare host, e.g. "bangla-pay-nine.vercel.app" — for display in UI. */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

/** Brand wordmark / display name. Doesn't change with domain. */
export const SITE_NAME = "BanglaPay";

/** Support email for error UI / contact links. */
export const SUPPORT_EMAIL = "hello@banglapay.com";

/** Build the canonical URL for a creator's public page. */
export function creatorUrl(handle: string): string {
  return `${SITE_URL}/${handle}`;
}

/** Display form of the creator URL — host + handle, no scheme. */
export function creatorDisplayUrl(handle: string): string {
  return `${SITE_HOST}/${handle}`;
}
