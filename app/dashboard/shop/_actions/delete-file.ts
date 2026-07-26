"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { productFiles, products } from "@/db/schema";
import { removeStorageObject } from "@/lib/storage/signed-urls";

import { requireCreator } from "./_helpers";

export interface DeleteFileInput {
  fileId: string;
}

export async function deleteProductFile(
  input: DeleteFileInput,
): Promise<{ ok: boolean; error?: string; unpublished?: boolean }> {
  const creator = await requireCreator();

  // Join to products so we only delete files the creator owns.
  const [row] = await db
    .select({
      file: productFiles,
      productId: products.id,
      isPublished: products.isPublished,
      slug: products.slug,
    })
    .from(productFiles)
    .innerJoin(products, eq(products.id, productFiles.productId))
    .where(
      and(
        eq(productFiles.id, input.fileId),
        eq(products.creatorId, creator.id),
      ),
    )
    .limit(1);

  if (!row) return { ok: false, error: "File not found." };

  await db
    .delete(productFiles)
    .where(eq(productFiles.id, input.fileId));

  const remainingFiles = await db
    .select({ id: productFiles.id })
    .from(productFiles)
    .where(eq(productFiles.productId, row.productId))
    .limit(1);
  const unpublished = row.isPublished && remainingFiles.length === 0;
  if (unpublished) {
    await db
      .update(products)
      .set({ isPublished: false, updatedAt: new Date() })
      .where(
        and(
          eq(products.id, row.productId),
          eq(products.creatorId, creator.id),
        ),
      );
  }

  // Best-effort: if storage delete fails, the row is already gone.
  await removeStorageObject(row.file.storagePath);

  revalidatePath(`/dashboard/shop/${row.productId}/edit`);
  if (unpublished) {
    revalidatePath("/dashboard/shop");
    revalidatePath(`/${creator.handle}`);
    revalidatePath(`/${creator.handle}/shop`);
    revalidatePath(`/${creator.handle}/shop/${row.slug}`);
  }
  return { ok: true, unpublished };
}
