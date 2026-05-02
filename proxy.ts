import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Per Next.js 16 docs, run the proxy on as many routes as possible for auth
// (so the optimistic redirect lands at the edge), but skip static assets and
// internal routes for performance.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|woff|woff2|ttf|otf)$).*)",
  ],
};
