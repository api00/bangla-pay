import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { creators } from "./creators";
import { messageKind } from "./enums";
import { orders } from "./orders";
import { tips } from "./tips";

// ---------- messages ----------
// Notes from supporters (attached to a tip or order, or sent directly via
// the public profile). Creator can reply once per message.
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    kind: messageKind("kind").notNull().default("direct"),
    tipId: uuid("tip_id").references(() => tips.id, { onDelete: "set null" }),
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    supporterName: text("supporter_name"),
    supporterEmail: text("supporter_email"),
    body: text("body").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    replyBody: text("reply_body"),
    repliedAt: timestamp("replied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("messages_creator_unread_idx").on(
      table.creatorId,
      table.isRead,
      table.createdAt,
    ),
  ],
);

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
