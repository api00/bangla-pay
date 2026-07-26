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
import {
  accessEventKind,
  deliveryMode,
  orderStatus,
  tipProvider,
} from "./enums";
import {
  productFiles,
  productVariants,
  products,
} from "./products";
import { supporters } from "./supporters";

// ---------- orders ----------
// A purchase from a creator's shop. May include multiple items.
// Money is integer paisa.
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    supporterId: uuid("supporter_id").references(() => supporters.id, {
      onDelete: "set null",
    }),
    supporterName: text("supporter_name"),
    supporterEmail: text("supporter_email").notNull(),
    orderCode: text("order_code").notNull(),
    totalPaisa: integer("total_paisa").notNull(),
    status: orderStatus("status").notNull().default("pending"),
    provider: tipProvider("provider"),
    providerRef: text("provider_ref"),
    licenseAcceptedAt: timestamp("license_accepted_at", {
      withTimezone: true,
    }),
    licenseVersion: text("license_version"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => [
    check("orders_total_nonneg", sql`${table.totalPaisa} >= 0`),
    index("orders_creator_created_idx").on(table.creatorId, table.createdAt),
    index("orders_supporter_email_idx").on(table.supporterEmail),
    uniqueIndex("orders_order_code_unique").on(table.orderCode),
    uniqueIndex("orders_provider_ref_unique")
      .on(table.provider, table.providerRef)
      .where(sql`${table.providerRef} IS NOT NULL`),
  ],
);

// ---------- order_items ----------
// `productTitleSnapshot` and `unitPricePaisa` are snapshots — preserved even
// if the product is renamed/repriced later.
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "restrict",
    }),
    productTitleSnapshot: text("product_title_snapshot").notNull(),
    unitPricePaisa: integer("unit_price_paisa").notNull(),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("order_items_order_idx").on(table.orderId),
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
    check(
      "order_items_unit_price_nonneg",
      sql`${table.unitPricePaisa} >= 0`,
    ),
  ],
);

// ---------- order_downloads ----------
// One row per (order_item × product_file). This is the buyer's durable
// entitlement; short-lived browser tokens are stored separately.
export const orderDownloads = pgTable(
  "order_downloads",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    productFileId: uuid("product_file_id")
      .notNull()
      .references(() => productFiles.id, { onDelete: "restrict" }),
    accessMode: deliveryMode("access_mode").notNull().default("download"),
    downloadToken: text("download_token").notNull(),
    downloadsUsed: integer("downloads_used").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("order_downloads_token_unique").on(table.downloadToken),
    index("order_downloads_order_item_idx").on(table.orderItemId),
  ],
);

// Short-lived, hashed browser tokens used by the reader, player, and download
// route. Plaintext tokens are never persisted.
export const mediaAccessTokens = pgTable(
  "media_access_tokens",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    orderDownloadId: uuid("order_download_id")
      .notNull()
      .references(() => orderDownloads.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    firstAccessedAt: timestamp("first_accessed_at", { withTimezone: true }),
    revoked: boolean("revoked").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("media_access_tokens_hash_unique").on(table.tokenHash),
    index("media_access_tokens_entitlement_idx").on(table.orderDownloadId),
    index("media_access_tokens_expires_idx").on(table.expiresAt),
  ],
);

// One event per issued access token, recorded on first successful use.
export const contentAccessEvents = pgTable(
  "content_access_events",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    orderDownloadId: uuid("order_download_id")
      .notNull()
      .references(() => orderDownloads.id, { onDelete: "cascade" }),
    supporterId: uuid("supporter_id").references(() => supporters.id, {
      onDelete: "set null",
    }),
    kind: accessEventKind("kind").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("content_access_events_order_idx").on(table.orderId, table.createdAt),
    index("content_access_events_entitlement_idx").on(table.orderDownloadId),
  ],
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderDownload = typeof orderDownloads.$inferSelect;
export type NewOrderDownload = typeof orderDownloads.$inferInsert;
export type MediaAccessToken = typeof mediaAccessTokens.$inferSelect;
export type ContentAccessEvent = typeof contentAccessEvents.$inferSelect;
