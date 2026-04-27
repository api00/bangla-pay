// Quick verification: list all tables in `public` and their RLS state.
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const client = postgres(databaseUrl, { prepare: false, max: 1 });

try {
  const rows = await client`
    SELECT c.relname AS table_name,
           c.relrowsecurity AS rls_enabled,
           (SELECT count(*) FROM pg_policies p
             WHERE p.schemaname = 'public' AND p.tablename = c.relname) AS policy_count
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind = 'r'
     ORDER BY c.relname;
  `;
  console.table(rows);
} finally {
  await client.end({ timeout: 5 });
}
