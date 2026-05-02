import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema/index";

// Lazy singleton — connection is opened on first query, NOT at module-load.
//
// Why lazy:
// - Next.js page-data collection during `next build` evaluates server modules
//   even when the route is fully dynamic. Throwing at module-load breaks the
//   build whenever DATABASE_URL is missing on the build machine.
// - Vercel injects env vars at runtime, not at build time, for many setups.
// - Routes like /d/[token] (file downloads) reference `db` but only run at
//   request time. The build itself shouldn't need a live DB connection.
//
// At first call we still fail fast with a clear error if the var is missing.

type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  _pg?: ReturnType<typeof postgres>;
  _drizzle?: Db;
};

function getDb(): Db {
  if (globalForDb._drizzle) return globalForDb._drizzle;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add it as an environment variable (Supabase Direct Connection, port 5432).",
    );
  }

  // Serverless connection-pool tuning for Supabase:
  // - `max: 1` — each serverless invocation runs in its own process and
  //   only ever needs one connection. Higher values just churn the pooler.
  // - `prepare: false` — required by Supabase's transaction-mode pooler.
  // - `idle_timeout: 20s` — return the socket to the pooler quickly.
  // - `max_lifetime: 30m` — replace stale connections.
  // - `connect_timeout: 10s` — fail fast on auth/network issues.
  const sql =
    globalForDb._pg ??
    postgres(databaseUrl, {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      connect_timeout: 10,
    });
  if (process.env.NODE_ENV !== "production") {
    globalForDb._pg = sql;
  }

  const instance = drizzle(sql, { schema });
  globalForDb._drizzle = instance;
  return instance;
}

// Proxy preserves the `db.select(...)`, `db.transaction(...)` API while keeping
// initialization deferred until first property access.
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export { schema };
