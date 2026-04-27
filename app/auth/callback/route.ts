import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

function safeNext(next: string | null): string {
  // Only allow relative paths starting with a single slash.
  if (!next) return "/dashboard";
  if (!next.startsWith("/")) return "/dashboard";
  if (next.startsWith("//") || next.startsWith("/\\")) return "/dashboard";
  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
