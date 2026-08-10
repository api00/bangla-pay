import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ---------- supporters ----------
// Optional supporter accounts — keyed by email. A row is created on first paid
// tip/order even if the supporter never logs in. If they later sign in via OTP
// with the same email, `userId` is linked.
export const supporters = pgTable(
  "supporters",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id"), // → auth.users.id (cross-schema FK in 0003_auth_links.sql)
    email: text("email").notNull(),
    libraryCodeHash: text("library_code_hash"),
    displayName: text("display_name"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("supporters_email_unique").on(table.email),
    uniqueIndex("supporters_user_id_unique").on(table.userId),
    uniqueIndex("supporters_library_code_hash_unique").on(
      table.libraryCodeHash,
    ),
  ],
);

export type Supporter = typeof supporters.$inferSelect;
export type NewSupporter = typeof supporters.$inferInsert;
