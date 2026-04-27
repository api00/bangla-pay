// Apply a SQL file to the Supabase database.
//
// Usage:
//   npm run db:apply -- drizzle/0002_phase1_schema.sql
//
// The script intentionally runs the file as ONE statement so multi-statement
// DO $$ ... $$ blocks and CREATE TYPE / ALTER TABLE / CREATE INDEX don't get
// chopped up at semicolons inside string literals.

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import postgres from "postgres";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-sql.mjs <path-to-sql>");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(
    "DATABASE_URL is not set. Run with: npm run db:apply -- <file>",
  );
  process.exit(1);
}

const absolute = resolve(process.cwd(), file);
const sql = await readFile(absolute, "utf8");

const client = postgres(databaseUrl, { prepare: false, max: 1 });

try {
  console.log(`Applying ${file} ...`);
  await client.unsafe(sql);
  console.log(`✓ Applied ${file}`);
} catch (error) {
  console.error(`✗ Failed to apply ${file}`);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await client.end({ timeout: 5 });
}
