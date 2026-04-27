import "server-only";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server-only Supabase admin client (service role).
 * Use ONLY for storage operations, RLS-bypassing system writes (audit_log,
 * webhooks_log), and never in any code path that runs near client bundles.
 *
 * If `SUPABASE_SERVICE_ROLE_KEY` is missing, the call throws a clear error so
 * the missing env var is obvious in dev. Get the key from the Supabase
 * dashboard → Settings → API → service_role.
 */
export function createAdminClient() {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  }
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local — Supabase dashboard → Settings → API → service_role.",
    );
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
