"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { getProductById, getProductFiles } from "@/db/queries/products";
import { products } from "@/db/schema";
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
): Promise<{ ok: boolean; error?: string }> {
  const creator = await requireCreator();
  const product = await getProductById(input.productId, creator.id);
  if (!product) return { ok: false, error: "Product not found." };

  // Remove every product file from Storage first; the DB cascade handles rows.
  const files = await getProductFiles(product.id);
  await Promise.allSettled(
    files.map((file) => removeStorageObject(file.storagePath)),
  );

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
      error: "This product has orders attached and can't be deleted. Unpublish it instead.",
    };
  }

  revalidatePath("/dashboard/shop");
  revalidatePath(`/${creator.handle}/shop`);
  redirect("/dashboard/shop");
}
