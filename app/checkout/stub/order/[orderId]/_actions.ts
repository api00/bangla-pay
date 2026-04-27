"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { upsertSupporterByEmail } from "@/db/queries/supporters";
import {
  creators,
  orderDownloads,
  orderItems,
  orders,
  productFiles,
  products,
} from "@/db/schema";
import { shortId } from "@/lib/ids";

interface ActionInput {
  orderId: string;
}

const DEFAULT_DOWNLOAD_TTL_HOURS = 168; // 7 days

/**
 * Stub success: flips order to `paid`, links supporter, generates one
 * `order_downloads` row per (item × file), increments product.totalSales.
 *
 * Phase 5 webhook handler will call the same logic — kept transactional.
 */
export async function markOrderPaid({ orderId }: ActionInput): Promise<void> {
  const [orderRow] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!orderRow) redirect("/");

  if (orderRow.status === "paid") {
    redirect(`/checkout/success?order=${orderRow.id}`);
  }
  if (orderRow.status !== "pending") redirect("/");

  const supporter = await upsertSupporterByEmail(
    orderRow.supporterEmail,
    orderRow.supporterName,
  );

  // Pull all items and their product files in one query.
  const itemFileRows = await db
    .select({
      itemId: orderItems.id,
      productId: orderItems.productId,
      fileId: productFiles.id,
      ttlHours: products.downloadTtlHours,
    })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .leftJoin(productFiles, eq(productFiles.productId, orderItems.productId))
    .where(eq(orderItems.orderId, orderId));

  const productIds = new Set(itemFileRows.map((r) => r.productId));

  const downloadRowsToInsert = itemFileRows
    .filter((row) => row.fileId !== null)
    .map((row) => {
      const ttlHours = row.ttlHours ?? DEFAULT_DOWNLOAD_TTL_HOURS;
      const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
      return {
        orderItemId: row.itemId,
        productFileId: row.fileId as string,
        downloadToken: shortId(20),
        expiresAt,
      };
    });

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        status: "paid",
        paidAt: new Date(),
        supporterId: supporter.id,
      })
      .where(and(eq(orders.id, orderId), eq(orders.status, "pending")));

    if (downloadRowsToInsert.length > 0) {
      await tx.insert(orderDownloads).values(downloadRowsToInsert);
    }

    if (productIds.size > 0) {
      await tx
        .update(products)
        .set({ totalSales: sql`${products.totalSales} + 1` })
        .where(inArray(products.id, Array.from(productIds)));
    }
  });

  const [creator] = await db
    .select({ handle: creators.handle })
    .from(creators)
    .where(eq(creators.id, orderRow.creatorId))
    .limit(1);

  if (creator?.handle) {
    revalidatePath(`/${creator.handle}/shop`);
    revalidatePath(`/${creator.handle}`);
  }
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");

  redirect(`/checkout/success?order=${orderRow.id}`);
}

export async function markOrderFailed({ orderId }: ActionInput): Promise<void> {
  await db
    .update(orders)
    .set({ status: "failed" })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending")));

  const [orderRow] = await db
    .select({ creatorId: orders.creatorId })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!orderRow) redirect("/");

  const [creator] = await db
    .select({ handle: creators.handle })
    .from(creators)
    .where(eq(creators.id, orderRow.creatorId))
    .limit(1);
  redirect(creator ? `/${creator.handle}/shop` : "/");
}
