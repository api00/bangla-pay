import "server-only";

import { and, asc, desc, eq, isNotNull } from "drizzle-orm";

import { db } from "@/db";
import {
  productFiles,
  products,
  type Product,
  type ProductFile,
} from "@/db/schema";

export async function listProductsForCreator(
  creatorId: string,
): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(eq(products.creatorId, creatorId))
    .orderBy(desc(products.updatedAt));
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
