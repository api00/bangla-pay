import { sql } from "drizzle-orm";
import {
  bigint,
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
  deliveryMode,
  pricingModel,
  productCategory,
  productType,
} from "./enums";

// ---------- products ----------
// Digital product in a creator's shop. `slug` is unique per creator
// so URLs look like `/{handle}/shop/{slug}`.
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    descriptionMd: text("description_md"),
    coverUrl: text("cover_url"),
    galleryUrls: text("gallery_urls")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    productType: productType("product_type")
      .notNull()
      .default("digital_download"),
    category: productCategory("category"),
    deliveryMode: deliveryMode("delivery_mode").notNull().default("download"),
    pricingModel: pricingModel("pricing_model").notNull().default("fixed"),
    basePricePaisa: integer("base_price_paisa").notNull().default(0),
    minPricePaisa: integer("min_price_paisa"),
    isPublished: boolean("is_published").notNull().default(false),
    externalUrl: text("external_url"),
    downloadLimit: integer("download_limit").notNull().default(5),
    downloadTtlHours: integer("download_ttl_hours").notNull().default(168),
    rightsConfirmedAt: timestamp("rights_confirmed_at", {
      withTimezone: true,
    }),
    // Set when a sold product is retired. Hiding it everywhere is the only
    // safe removal — deleting the row would cascade its files away and take
    // buyers' access with them.
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    totalSales: integer("total_sales").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("products_creator_slug_unique").on(
      table.creatorId,
      table.slug,
    ),
    index("products_creator_published_idx").on(
      table.creatorId,
      table.isPublished,
    ),
    check(
      "products_base_price_nonneg",
      sql`${table.basePricePaisa} >= 0`,
    ),
    check(
      "products_min_price_nonneg",
      sql`${table.minPricePaisa} IS NULL OR ${table.minPricePaisa} >= 0`,
    ),
  ],
);

// ---------- product_files ----------
// Files uploaded for a product. `storagePath` is the Supabase Storage key
// (private bucket); never expose the raw key in URLs.
export const productFiles = pgTable(
  "product_files",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    storagePath: text("storage_path").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("product_files_product_idx").on(table.productId)],
);

// ---------- product_variants ----------
// Optional pricing tiers (e.g. "Standard / Studio / Stems").
export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    pricePaisa: integer("price_paisa").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("product_variants_product_idx").on(table.productId),
    check("product_variants_price_nonneg", sql`${table.pricePaisa} >= 0`),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductFile = typeof productFiles.$inferSelect;
export type NewProductFile = typeof productFiles.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
