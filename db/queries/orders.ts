import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  orderDownloads,
  orderItems,
  orders,
  productFiles,
  products,
  type Order,
  type OrderDownload,
  type OrderItem,
  type Product,
  type ProductFile,
} from "@/db/schema";

export async function listOrdersForCreator(
  creatorId: string,
  limit = 50,
): Promise<Order[]> {
  return db
    .select()
    .from(orders)
    .where(eq(orders.creatorId, creatorId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export interface OrderItemDetail {
  item: OrderItem;
  product: Pick<Product, "id" | "title" | "slug">;
}

export interface OrderDetail {
  order: Order;
  items: OrderItemDetail[];
  downloads: Array<{
    download: OrderDownload;
    file: Pick<ProductFile, "id" | "filename" | "mimeType" | "sizeBytes">;
    item: OrderItem;
  }>;
}

export async function getOrderForCreator(
  creatorId: string,
  orderId: string,
): Promise<OrderDetail | null> {
  const orderRows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.creatorId, creatorId)))
    .limit(1);
  const order = orderRows[0];
  if (!order) return null;
  return loadOrderDetail(order);
}

/** Used by the supporter-facing success page (no auth) — must match by email. */
export async function getOrderForSupporter(
  orderId: string,
): Promise<OrderDetail | null> {
  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  const order = orderRows[0];
  if (!order) return null;
  return loadOrderDetail(order);
}

async function loadOrderDetail(order: Order): Promise<OrderDetail> {
  const itemRows = await db
    .select({
      item: orderItems,
      product: {
        id: products.id,
        title: products.title,
        slug: products.slug,
      },
    })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(eq(orderItems.orderId, order.id));

  const itemIds = itemRows.map((row) => row.item.id);

  const downloadRows = itemIds.length
    ? await db
        .select({
          download: orderDownloads,
          file: {
            id: productFiles.id,
            filename: productFiles.filename,
            mimeType: productFiles.mimeType,
            sizeBytes: productFiles.sizeBytes,
          },
          item: orderItems,
        })
        .from(orderDownloads)
        .innerJoin(
          productFiles,
          eq(productFiles.id, orderDownloads.productFileId),
        )
        .innerJoin(orderItems, eq(orderItems.id, orderDownloads.orderItemId))
        .where(eq(orderItems.orderId, order.id))
    : [];

  return {
    order,
    items: itemRows,
    downloads: downloadRows,
  };
}
