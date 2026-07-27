"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { getProductById, getProductFiles } from "@/db/queries/products";
import { orderItems, products } from "@/db/schema";
import { removeStorageObject } from "@/lib/storage/signed-urls";

import { requireCreator } from "./_helpers";

export interface DeleteProductInput {
  productId: string;
}

/** Hard-delete a product. Cascades order_items? No — orders.product_id has
 *  ON DELETE RESTRICT so orders preserve sales history. Block deletion when
 *  a product has any orders attached. */
export async function deleteProduct(
  input: DeleteProductInput,
): Promise<{ ok: boolean; error?: string; archived?: boolean }> {
  const creator = await requireCreator();
  const product = await getProductById(input.productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };

  // Check for attached orders BEFORE touching Storage. `order_items.product_id`
  // is ON DELETE RESTRICT so the delete would fail anyway — but the files would
  // already be gone by then, leaving a live product with no deliverable.
  const [attached] = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .where(eq(orderItems.productId, product.id))
    .limit(1);
  if (attached) {
    // Someone has bought this. Removing the row would cascade its files away
    // and break access the buyer paid for, so retire it instead: gone from the
    // shop and every public surface, entitlements untouched.
    await db
      .update(products)
      .set({ isPublished: false, archivedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(products.id, input.productId),
          eq(products.creatorId, creator.id),
        ),
      );

    revalidatePath("/dashboard/shop");
    revalidatePath(`/${creator.handle}/shop`);
    revalidatePath(`/${creator.handle}`);

    return { ok: true, archived: true };
  }

  const files = await getProductFiles(product.id);

  try {
    await db
      .delete(products)
      .where(
        and(
          eq(products.id, input.productId),
          eq(products.creatorId, creator.id),
        ),
      );
  } catch {
    return {
      ok: false,
      error: "Couldn't delete this product. Please try again.",
    };
  }

  // Only once the row is gone do we drop the objects it referenced.
  await Promise.allSettled(
    files.map((file) => removeStorageObject(file.storagePath)),
  );

  revalidatePath("/dashboard/shop");
  revalidatePath(`/${creator.handle}/shop`);
  revalidatePath(`/${creator.handle}`);

  return { ok: true };
}
