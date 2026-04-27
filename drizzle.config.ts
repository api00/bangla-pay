import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local — use the Supabase Direct Connection (port 5432).",
  );
}

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
  // Only manage our own schema — never touch Supabase-owned schemas (auth, storage, etc.).
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});
