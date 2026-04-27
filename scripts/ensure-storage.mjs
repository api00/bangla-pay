// Idempotent setup for Supabase Storage buckets.
//
// Usage:
//   npm run db:storage
//
// Reads SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL from .env.local.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BUCKETS = [
  { id: "product-files", public: false },
  { id: "public-assets", public: true },
];

async function ensureBucket({ id, public: isPublic }) {
  const { data: existing } = await supabase.storage.getBucket(id);
  if (existing) {
    if (existing.public !== isPublic) {
      const { error } = await supabase.storage.updateBucket(id, { public: isPublic });
      if (error) throw error;
      console.log(`✓ Bucket "${id}" updated (public=${isPublic})`);
    } else {
      console.log(`✓ Bucket "${id}" exists (public=${isPublic})`);
    }
    return;
  }
  const { error } = await supabase.storage.createBucket(id, { public: isPublic });
  if (error) throw error;
  console.log(`✓ Bucket "${id}" created (public=${isPublic})`);
}

try {
  for (const bucket of BUCKETS) {
    await ensureBucket(bucket);
  }
  console.log("All buckets ready.");
} catch (error) {
  console.error("Failed to ensure buckets:", error?.message ?? error);
  process.exit(1);
}
