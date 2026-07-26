import { and, eq, sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/db";
import { orderDownloads, orderItems, orders, productFiles, products } from "@/db/schema";
import { signedProductFileDownload } from "@/lib/storage/signed-urls";

interface Params {
  token: string;
}

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<Params> },
) {
  const { token } = await ctx.params;
  if (!token) {
    return new NextResponse("Invalid link.", { status: 400 });
  }

  // Look up the download with everything we need to validate + stream.
  const [row] = await db
    .select({
      downloadId: orderDownloads.id,
      downloadsUsed: orderDownloads.downloadsUsed,
      expiresAt: orderDownloads.expiresAt,
      accessMode: orderDownloads.accessMode,
      storagePath: productFiles.storagePath,
      filename: productFiles.filename,
      orderStatus: orders.status,
      downloadLimit: products.downloadLimit,
    })
    .from(orderDownloads)
    .innerJoin(productFiles, eq(productFiles.id, orderDownloads.productFileId))
    .innerJoin(orderItems, eq(orderItems.id, orderDownloads.orderItemId))
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(eq(orderDownloads.downloadToken, token))
    .limit(1);

  if (!row) {
    return new NextResponse("Download not found.", { status: 404 });
  }
  if (row.orderStatus !== "paid") {
    return new NextResponse("Order not paid.", { status: 403 });
  }
  if (row.accessMode !== "download") {
    return new NextResponse("This product is available in the private library.", {
      status: 403,
    });
  }
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return new NextResponse("This link has expired.", { status: 410 });
  }
  if (row.downloadsUsed >= row.downloadLimit) {
    return new NextResponse("Download limit reached.", { status: 410 });
  }

  // Bump the counter atomically — guards against concurrent reads pushing
  // past the limit. We only proceed if the update actually happens.
  const updated = await db
    .update(orderDownloads)
    .set({ downloadsUsed: sql`${orderDownloads.downloadsUsed} + 1` })
    .where(
      and(
        eq(orderDownloads.id, row.downloadId),
        sql`${orderDownloads.downloadsUsed} < ${row.downloadLimit}`,
      ),
    )
    .returning({ downloadsUsed: orderDownloads.downloadsUsed });

  if (updated.length === 0) {
    return new NextResponse("Download limit reached.", { status: 410 });
  }

  let signedUrl: string;
  try {
    signedUrl = await signedProductFileDownload(row.storagePath, row.filename);
  } catch {
    return new NextResponse("Could not prepare download. Try again.", {
      status: 500,
    });
  }

  return NextResponse.redirect(signedUrl);
}
