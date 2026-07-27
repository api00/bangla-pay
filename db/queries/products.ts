import "server-only";

import { and, asc, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import type { ProductSort } from "@/lib/product-sort";
import {
  productFiles,
  products,
  type Product,
  type ProductFile,
} from "@/db/schema";

export async function listProductsForCreator(
  creatorId: string,
  sort: ProductSort = "updated",
): Promise<Product[]> {
  const orderBy = {
    updated: desc(products.updatedAt),
    newest: desc(products.createdAt),
    title: asc(products.title),
    price: desc(products.basePricePaisa),
    sales: desc(products.totalSales),
  }[sort];

  return db
    .select()
    .from(products)
    .where(and(eq(products.creatorId, creatorId), isNull(products.archivedAt)))
    .orderBy(orderBy);
}

export interface ProductWithStats extends Product {
  /** Number of deliverable files attached. */
  fileCount: number;
  /** Combined size of those files, in bytes. */
  totalBytes: number;
}

/**
 * Listing rows plus their deliverable stats, in one round-trip.
 *
 * A LEFT JOIN + GROUP BY keeps this to a single query rather than one
 * getProductFiles() call per card.
 */
export async function listProductsWithStats(
  creatorId: string,
  sort: ProductSort = "updated",
): Promise<ProductWithStats[]> {
  const orderBy = {
    updated: desc(products.updatedAt),
    newest: desc(products.createdAt),
    title: asc(products.title),
    price: desc(products.basePricePaisa),
    sales: desc(products.totalSales),
  }[sort];

  const rows = await db
    .select({
      product: products,
      fileCount: sql<number>`count(${productFiles.id})::int`,
      totalBytes: sql<number>`coalesce(sum(${productFiles.sizeBytes}), 0)::bigint`,
    })
    .from(products)
    .leftJoin(productFiles, eq(productFiles.productId, products.id))
    .where(and(eq(products.creatorId, creatorId), isNull(products.archivedAt)))
    .groupBy(products.id)
    .orderBy(orderBy);

  return rows.map((row) => ({
    ...row.product,
    fileCount: Number(row.fileCount ?? 0),
    totalBytes: Number(row.totalBytes ?? 0),
  }));
}

export async function getProductById(
  productId: string,
  creatorId: string,
): Promise<Product | null> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), eq(products.creatorId, creatorId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getProductFiles(
  productId: string,
): Promise<ProductFile[]> {
  return db
    .select()
    .from(productFiles)
    .where(eq(productFiles.productId, productId))
    .orderBy(asc(productFiles.position), asc(productFiles.createdAt));
}

export async function listPublishedProducts(
  creatorId: string,
): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.creatorId, creatorId),
        eq(products.isPublished, true),
        isNull(products.archivedAt),
        isNotNull(products.category),
        isNotNull(products.rightsConfirmedAt),
      ),
    )
    .orderBy(desc(products.totalSales), desc(products.updatedAt));
}

export interface PublicProductBundle {
  product: Product;
  files: ProductFile[];
}

/** Lookup a product on a public shop page by handle + slug. */
export async function getPublicProduct(
  creatorId: string,
  slug: string,
): Promise<PublicProductBundle | null> {
  const productRows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.creatorId, creatorId),
        eq(products.slug, slug),
        eq(products.isPublished, true),
        isNull(products.archivedAt),
        isNotNull(products.category),
        isNotNull(products.rightsConfirmedAt),
      ),
    )
    .limit(1);
  const product = productRows[0];
  if (!product) return null;
  const files = await getProductFiles(product.id);
  return { product, files };
}
