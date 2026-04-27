import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { creators } from "./creators";

// ---------- webhooks_log ----------
// Raw provider events (bKash / Nagad / SSLCOMMERZ) — stored before
// processing so we can replay or audit. Signature verification result is
// recorded explicitly so a failure never gets re-processed silently.
export const webhooksLog = pgTable(
  "webhooks_log",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    provider: text("provider").notNull(),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").notNull(),
    signature: text("signature"),
    signatureValid: boolean("signature_valid").notNull().default(false),
    processed: boolean("processed").notNull().default(false),
    error: text("error"),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => [
    index("webhooks_log_provider_processed_idx").on(
      table.provider,
      table.processed,
    ),
  ],
);

// ---------- audit_log ----------
// Trail for sensitive operations (payout request, payout method change,
// handle change, KYC update). `actorUserId` is `auth.users.id`.
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    actorUserId: uuid("actor_user_id"),
    entity: text("entity").notNull(),
    entityId: uuid("entity_id"),
    action: text("action").notNull(),
    before: jsonb("before"),
    after: jsonb("after"),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_log_entity_idx").on(table.entity, table.entityId),
    index("audit_log_actor_idx").on(table.actorUserId, table.at),
  ],
);

// ---------- analytics_daily ----------
// Pre-aggregated metrics per creator per day. Repopulated nightly via pg_cron.
// PK is composite (creatorId, date) so upserts are cheap.
export const analyticsDaily = pgTable(
  "analytics_daily",
  {
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    tipsCount: integer("tips_count").notNull().default(0),
    tipsPaisa: integer("tips_paisa").notNull().default(0),
    ordersCount: integer("orders_count").notNull().default(0),
    ordersPaisa: integer("orders_paisa").notNull().default(0),
    uniqueSupporters: integer("unique_supporters").notNull().default(0),
    pageViews: integer("page_views").notNull().default(0),
  },
  (table) => [
    primaryKey({
      name: "analytics_daily_pk",
      columns: [table.creatorId, table.date],
    }),
  ],
);

export type WebhookLog = typeof webhooksLog.$inferSelect;
export type NewWebhookLog = typeof webhooksLog.$inferInsert;
export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
export type AnalyticsDaily = typeof analyticsDaily.$inferSelect;
export type NewAnalyticsDaily = typeof analyticsDaily.$inferInsert;
