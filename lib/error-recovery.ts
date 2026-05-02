// Heuristics + helpers for self-healing the app after a Vercel deploy.
//
// After every deployment, browsers that still have an open tab keep their
// old JS chunks cached. When the new RSC payload arrives it references
// module IDs the old chunks don't know — React throws and the route's
// error.tsx fires. Logging out clears the tab; we want to clear it
// automatically instead.

const STALE_PATTERNS = [
  /chunkloaderror/i,
  /failed to fetch dynamically imported module/i,
  /loading chunk \d+ failed/i,
  /loading css chunk/i,
  /bailout_to_client_side_rendering/i,
  /failed to fetch/i,
  /networkerror/i,
  /unexpected token '<'/i, // server returned HTML where JS was expected
  /script error/i,
];

/** True if the error looks like the user's tab is running stale chunks
 *  against a freshly deployed server. */
export function looksLikeDeploymentSkew(error: Error): boolean {
  const haystack = `${error.message} ${error.name} ${error.stack ?? ""}`;
  return STALE_PATTERNS.some((re) => re.test(haystack));
}

const STORAGE_KEY = "banglapay:last-recovery";
const COOLDOWN_MS = 30_000;

/** Reload the page once and remember we did so, so we don't loop forever
 *  if the error is real (not a stale-chunk one). Returns true if we
 *  triggered a reload. */
export function tryAutoRecover(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const last = Number(sessionStorage.getItem(STORAGE_KEY) ?? "0");
    if (Date.now() - last < COOLDOWN_MS) {
      // We already tried recently — don't loop.
      return false;
    }
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // sessionStorage might be blocked (Safari private mode) — proceed anyway.
  }
  // hard reload bypasses bfcache and forces fresh chunks.
  window.location.reload();
  return true;
}

/** Clear the recovery flag — call once after a successful render so the
 *  next legitimate error can trigger another recovery attempt. */
export function markRecovered(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
