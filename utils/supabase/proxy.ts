import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Strict allowlist for what an unauthenticated visitor may reach. Everything
// under these prefixes redirects to /login when the session cookie is missing.
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding"];

// Already signed in? Bounce away from these.
const AUTH_ROUTES = ["/login", "/signup"];

const PATHNAME_HEADER = "x-banglapay-pathname";

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

function safeNext(next: string | null): string | null {
  if (!next?.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return null;
  }
  return next;
}

/**
 * Proxy session refresh + optimistic auth gate.
 *
 * Per the Next.js 16 authentication guide, this proxy performs an
 * **optimistic** check (cookie-based) only. It exists to:
 *   1. Refresh the Supabase session cookie so server components see fresh state.
 *   2. Redirect unauthenticated visitors away from /dashboard and /onboarding
 *      at the edge — saving a wasted page render on the origin.
 *
 * The authoritative authorization check lives in `lib/auth.ts` (`requireCreator`)
 * and is enforced inside every protected page + every Server Action.
 *
 * Do NOT add database calls here — the proxy runs on every prefetched request
 * and slow checks here become a real performance problem fast.
 */
export async function updateSession(request: NextRequest) {
  // Pass the path through to Server Components via a request header. Next.js
  // does not expose pathname inside layouts otherwise.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(PATHNAME_HEADER, request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request: { headers: requestHeaders },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // CRITICAL: refreshes the auth session. Do NOT remove.
  // Do NOT add logic between createServerClient and getUser — it can desync
  // cookies. (Supabase SSR auth invariant.)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  // Buyer library routes stay reachable without an account. Their pages and
  // file routes perform the authoritative Library Code or checkout-grant check.
  if (!user && isProtected(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthRoute(pathname)) {
    const destination = safeNext(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(
      new URL(destination ?? "/dashboard", request.url),
    );
  }

  return supabaseResponse;
}
