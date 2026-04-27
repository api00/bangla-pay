import { customType } from "drizzle-orm/pg-core";

// `bytea` — Postgres binary blob.
// Used for encrypted payout details (pgsodium / Vault output).
export const bytea = customType<{ data: Buffer; default: false }>({
  dataType() {
    return "bytea";
  },
});
