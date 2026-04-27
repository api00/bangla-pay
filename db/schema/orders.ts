import { sql } from "drizzle-orm";
import {
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
import { orderStatus, tipProvider } from "./enums";
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
    totalPaisa: integer("total_paisa").notNull(),
    status: orderStatus("status").notNull().default("pending"),
    provider: tipProvider("provider"),
    providerRef: text("provider_ref"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => [
    check("orders_total_nonneg", sql`${table.totalPaisa} >= 0`),
    index("orders_creator_created_idx").on(table.creatorId, table.createdAt),
    index("orders_supporter_email_idx").on(table.supporterEmail),
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
// One row per (order_item × product_file). The supporter's download URL is
// `/d/{downloadToken}`. Server validates token, streams the file via signed
// Storage URL, and increments `downloadsUsed`.
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
    downloadToken: text("download_token").notNull(),
    downloadsUsed: integer("downloads_used").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("order_downloads_token_unique").on(table.downloadToken),
    index("order_downloads_order_item_idx").on(table.orderItemId),
  ],
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderDownload = typeof orderDownloads.$inferSelect;
export type NewOrderDownload = typeof orderDownloads.$inferInsert;
