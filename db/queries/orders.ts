import "server-only";

import { and, desc, eq, inArray, or, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  orderDownloads,
  orderItems,
  orders,
  productFiles,
  products,
  contentAccessEvents,
  type ContentAccessEvent,
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
  accessEvents: ContentAccessEvent[];
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

/** Paid order lookup for the authenticated buyer. Email matching is required. */
export async function getOrderForBuyer(
  orderCode: string,
  buyerEmail: string,
): Promise<OrderDetail | null> {
  const orderRows = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.orderCode, orderCode),
        eq(orders.status, "paid"),
        sql`lower(${orders.supporterEmail}) = ${buyerEmail.toLowerCase()}`,
      ),
    )
    .limit(1);
  const order = orderRows[0];
  if (!order) return null;
  return loadOrderDetail(order);
}

export async function listOrdersForBuyer(
  buyerEmail: string,
  limit = 50,
): Promise<Order[]> {
  return db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.status, "paid"),
        sql`lower(${orders.supporterEmail}) = ${buyerEmail.toLowerCase()}`,
      ),
    )
    .orderBy(desc(orders.paidAt), desc(orders.createdAt))
    .limit(limit);
}

/**
 * Paid order by code, with NO buyer check.
 *
 * The caller must authorize — either a matching signed-in email or a browser
 * grant from lib/order-grants. Never expose this result directly.
 */
export async function getPaidOrderByCode(
  orderCode: string,
): Promise<OrderDetail | null> {
  const rows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.orderCode, orderCode), eq(orders.status, "paid")))
    .limit(1);
  const order = rows[0];
  if (!order) return null;
  return loadOrderDetail(order);
}

/** Paid orders for an account, checkout grants, or a Library Code session. */
export async function listOrdersForBuyerOrGrants(
  buyerEmail: string | null,
  grantedOrderIds: string[],
  supporterId: string | null,
  limit = 50,
): Promise<Order[]> {
  if (!buyerEmail && grantedOrderIds.length === 0 && !supporterId) return [];

  const clauses = [];
  if (buyerEmail) {
    clauses.push(
      sql`lower(${orders.supporterEmail}) = ${buyerEmail.toLowerCase()}`,
    );
  }
  if (grantedOrderIds.length > 0) {
    clauses.push(inArray(orders.id, grantedOrderIds));
  }
  if (supporterId) clauses.push(eq(orders.supporterId, supporterId));

  return db
    .select()
    .from(orders)
    .where(and(eq(orders.status, "paid"), or(...clauses)))
    .orderBy(desc(orders.paidAt), desc(orders.createdAt))
    .limit(limit);
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

  const accessEvents = await db
    .select()
    .from(contentAccessEvents)
    .where(eq(contentAccessEvents.orderId, order.id))
    .orderBy(desc(contentAccessEvents.createdAt));

  return {
    order,
    items: itemRows,
    accessEvents,
    downloads: downloadRows,
  };
}
