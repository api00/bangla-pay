import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema/index";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local — Supabase Direct Connection (port 5432).",
  );
}

// Singleton connection — avoids exhausting pg connections during Next dev hot reload.
const globalForDb = globalThis as unknown as {
  _pg?: ReturnType<typeof postgres>;
};

const sql = globalForDb._pg ?? postgres(databaseUrl, { prepare: false });
if (process.env.NODE_ENV !== "production") {
  globalForDb._pg = sql;
}

export const db = drizzle(sql, { schema });
export { schema };
