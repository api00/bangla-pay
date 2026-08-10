"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { evaluateMilestonesForCreator } from "@/db/queries/milestone-eval";
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
import { ensureLibraryCodeForSupporter } from "@/lib/library-codes";
import { grantOrderAccess } from "@/lib/order-grants";

interface ActionInput {
  orderId: string;
}

/**
 * Stub success: flips order to `paid`, links supporter, generates one
 * durable entitlement per (item × file), and increments product.totalSales.
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
    if (orderRow.supporterId) {
      await ensureLibraryCodeForSupporter(orderRow.supporterId);
    }
    await grantOrderAccess(orderRow.id);
    redirect(`/library/${orderRow.orderCode}?new=1`);
  }
  if (orderRow.status !== "pending") redirect("/");
  if (!orderRow.licenseAcceptedAt || !orderRow.licenseVersion) redirect("/");

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
      accessMode: products.deliveryMode,
    })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .leftJoin(productFiles, eq(productFiles.productId, orderItems.productId))
    .where(eq(orderItems.orderId, orderId));

  const productIds = new Set(itemFileRows.map((r) => r.productId));

  const downloadRowsToInsert = itemFileRows
    .filter((row) => row.fileId !== null)
    .map((row) => ({
      orderItemId: row.itemId,
      productFileId: row.fileId as string,
      accessMode: row.accessMode,
      downloadToken: shortId(20),
      expiresAt: null,
    }));

  const paidNow = await db.transaction(async (tx) => {
    const updated = await tx
      .update(orders)
      .set({
        status: "paid",
        paidAt: new Date(),
        supporterId: supporter.id,
      })
      .where(and(eq(orders.id, orderId), eq(orders.status, "pending")))
      .returning({ id: orders.id });

    if (updated.length === 0) return false;

    if (downloadRowsToInsert.length > 0) {
      await tx.insert(orderDownloads).values(downloadRowsToInsert);
    }

    if (productIds.size > 0) {
      await tx
        .update(products)
        .set({ totalSales: sql`${products.totalSales} + 1` })
        .where(inArray(products.id, Array.from(productIds)));
    }
    return true;
  });

  if (paidNow) {
    await ensureLibraryCodeForSupporter(supporter.id);
    await evaluateMilestonesForCreator(orderRow.creatorId);

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
    revalidatePath("/dashboard/supporters");
    revalidatePath("/dashboard/settings/payouts");
    revalidatePath("/dashboard");
  }

  // This checkout grant opens the purchase immediately. The permanent Library
  // Code created above then gives the buyer cross-device, no-account access.
  await grantOrderAccess(orderRow.id);

  redirect(`/library/${orderRow.orderCode}?new=1`);
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
