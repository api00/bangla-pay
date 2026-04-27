import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { bytea } from "./_custom-types";
import { creators } from "./creators";
import { payoutMethod, payoutStatus } from "./enums";

// ---------- payout_methods ----------
// Where the creator wants money sent. `encryptedDetails` stores the full
// account info (encrypted via pgsodium / Vault). `accountLabel` is the
// human-friendly preview (e.g. last 4 digits).
export const payoutMethods = pgTable(
  "payout_methods",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    method: payoutMethod("method").notNull(),
    accountLabel: text("account_label").notNull(),
    encryptedDetails: bytea("encrypted_details").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    isVerified: boolean("is_verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("payout_methods_creator_idx").on(table.creatorId),
    uniqueIndex("payout_methods_creator_default_unique")
      .on(table.creatorId)
      .where(sql`${table.isDefault} = true`),
  ],
);

// ---------- payouts ----------
export const payouts = pgTable(
  "payouts",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "restrict" }),
    payoutMethodId: uuid("payout_method_id")
      .notNull()
      .references(() => payoutMethods.id, { onDelete: "restrict" }),
    amountPaisa: integer("amount_paisa").notNull(),
    feePaisa: integer("fee_paisa").notNull().default(0),
    netPaisa: integer("net_paisa").notNull(),
    method: payoutMethod("method").notNull(),
    status: payoutStatus("status").notNull().default("requested"),
    providerRef: text("provider_ref"),
    failureReason: text("failure_reason"),
    requestedAt: timestamp("requested_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    settledAt: timestamp("settled_at", { withTimezone: true }),
  },
  (table) => [
    index("payouts_creator_status_idx").on(table.creatorId, table.status),
    check("payouts_amount_positive", sql`${table.amountPaisa} > 0`),
    check("payouts_fee_nonneg", sql`${table.feePaisa} >= 0`),
    check(
      "payouts_net_consistent",
      sql`${table.netPaisa} = ${table.amountPaisa} - ${table.feePaisa}`,
    ),
  ],
);

export type PayoutMethod = typeof payoutMethods.$inferSelect;
export type NewPayoutMethod = typeof payoutMethods.$inferInsert;
export type Payout = typeof payouts.$inferSelect;
export type NewPayout = typeof payouts.$inferInsert;
