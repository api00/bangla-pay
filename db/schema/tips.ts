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

import { creators } from "./creators";
import { tipProvider, tipStatus } from "./enums";
import { supporters } from "./supporters";

// ---------- tips ----------
// One-off support payment from a supporter to a creator.
// `amountPaisa` is integer paisa (1/100 taka). NEVER store money as float.
export const tips = pgTable(
  "tips",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    supporterId: uuid("supporter_id").references(() => supporters.id, {
      onDelete: "set null",
    }),
    // Snapshots — anonymous tips won't have a supporter row, and even logged-in
    // supporters may rename themselves later. Store the displayed values here.
    supporterName: text("supporter_name"),
    supporterEmail: text("supporter_email"),
    amountPaisa: integer("amount_paisa").notNull(),
    chaCount: integer("cha_count"),
    message: text("message"),
    messageIsPublic: boolean("message_is_public").notNull().default(false),
    provider: tipProvider("provider"),
    providerRef: text("provider_ref"),
    status: tipStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => [
    check("tips_amount_positive", sql`${table.amountPaisa} > 0`),
    index("tips_creator_created_idx").on(table.creatorId, table.createdAt),
    uniqueIndex("tips_provider_ref_unique")
      .on(table.provider, table.providerRef)
      .where(sql`${table.providerRef} IS NOT NULL`),
  ],
);

export type Tip = typeof tips.$inferSelect;
export type NewTip = typeof tips.$inferInsert;
