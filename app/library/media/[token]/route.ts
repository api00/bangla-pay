import { and, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { type NextRequest } from "next/server";

import { db } from "@/db";
import {
  contentAccessEvents,
  mediaAccessTokens,
  orderDownloads,
  orderItems,
  orders,
  productFiles,
  products,
} from "@/db/schema";
import { hashMediaToken } from "@/lib/media-access";
import { readLibrarySupporterGrant } from "@/lib/library-codes";
import { readOrderGrants } from "@/lib/order-grants";
import { signedProductFileAccess } from "@/lib/storage/signed-urls";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Params {
  token: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> },
) {
  const { token } = await context.params;
  if (!token) return textResponse("Invalid access token.", 400);

  const grants = await readOrderGrants();
  const librarySupporterId = await readLibrarySupporterGrant();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email && grants.length === 0 && !librarySupporterId) {
    return textResponse("Enter your Library Code to access this product.", 401);
  }

  const ownership = [];
  if (user?.email) {
    ownership.push(
      sql`lower(${orders.supporterEmail}) = ${user.email.toLowerCase()}`,
    );
  }
  if (grants.length > 0) ownership.push(inArray(orders.id, grants));
  if (librarySupporterId) {
    ownership.push(eq(orders.supporterId, librarySupporterId));
  }

  const [access] = await db
    .select({
      tokenId: mediaAccessTokens.id,
      expiresAt: mediaAccessTokens.expiresAt,
      revoked: mediaAccessTokens.revoked,
      entitlementId: orderDownloads.id,
      accessMode: orderDownloads.accessMode,
      downloadsUsed: orderDownloads.downloadsUsed,
      orderId: orders.id,
      supporterId: orders.supporterId,
      storagePath: productFiles.storagePath,
      filename: productFiles.filename,
      mimeType: productFiles.mimeType,
      downloadLimit: products.downloadLimit,
    })
    .from(mediaAccessTokens)
    .innerJoin(
      orderDownloads,
      eq(orderDownloads.id, mediaAccessTokens.orderDownloadId),
    )
    .innerJoin(productFiles, eq(productFiles.id, orderDownloads.productFileId))
    .innerJoin(orderItems, eq(orderItems.id, orderDownloads.orderItemId))
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(
      and(
        eq(mediaAccessTokens.tokenHash, hashMediaToken(token)),
        eq(orders.status, "paid"),
        or(...ownership),
      ),
    )
    .limit(1);

  if (!access) return textResponse("Access not found.", 404);
  if (access.revoked || access.expiresAt.getTime() <= Date.now()) {
    return textResponse("This access session expired. Reload your library.", 410);
  }

  let signedUrl: string;
  try {
    signedUrl = await signedProductFileAccess(access.storagePath);
  } catch {
    return textResponse("Could not prepare this product. Try again.", 500);
  }

  const upstreamHeaders = new Headers();
  const range = request.headers.get("range");
  if (range) upstreamHeaders.set("range", range);

  let upstream: Response;
  try {
    upstream = await fetch(signedUrl, {
      headers: upstreamHeaders,
      cache: "no-store",
    });
  } catch {
    return textResponse("Could not load this product. Try again.", 502);
  }
  if (!upstream.ok || !upstream.body) {
    return textResponse("Could not load this product. Try again.", 502);
  }

  const accessRecorded = await recordFirstAccess(access);
  if (!accessRecorded.allowed) {
    return textResponse("Download limit reached.", 410);
  }

  const responseHeaders = new Headers({
    "Cache-Control": "private, no-store, max-age=0",
    "Content-Type": access.mimeType,
    "Content-Disposition": contentDisposition(
      access.filename,
      access.accessMode === "download",
    ),
    "X-Content-Type-Options": "nosniff",
  });
  copyHeader(upstream.headers, responseHeaders, "accept-ranges");
  copyHeader(upstream.headers, responseHeaders, "content-length");
  copyHeader(upstream.headers, responseHeaders, "content-range");

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

async function recordFirstAccess(access: {
  tokenId: string;
  entitlementId: string;
  orderId: string;
  supporterId: string | null;
  accessMode: "view_only" | "stream_only" | "download";
  downloadLimit: number;
}): Promise<{ allowed: boolean }> {
  return db.transaction(async (tx) => {
    const claimed = await tx
      .update(mediaAccessTokens)
      .set({ firstAccessedAt: new Date() })
      .where(
        and(
          eq(mediaAccessTokens.id, access.tokenId),
          isNull(mediaAccessTokens.firstAccessedAt),
        ),
      )
      .returning({ id: mediaAccessTokens.id });
    if (claimed.length === 0) return { allowed: true };

    if (access.accessMode === "download") {
      const updated = await tx
        .update(orderDownloads)
        .set({ downloadsUsed: sql`${orderDownloads.downloadsUsed} + 1` })
        .where(
          and(
            eq(orderDownloads.id, access.entitlementId),
            sql`${orderDownloads.downloadsUsed} < ${access.downloadLimit}`,
          ),
        )
        .returning({ id: orderDownloads.id });
      if (updated.length === 0) {
        await tx
          .update(mediaAccessTokens)
          .set({ revoked: true })
          .where(eq(mediaAccessTokens.id, access.tokenId));
        return { allowed: false };
      }
    }

    const kind =
      access.accessMode === "view_only"
        ? "view"
        : access.accessMode === "stream_only"
          ? "stream"
          : "download";
    await tx.insert(contentAccessEvents).values({
      orderId: access.orderId,
      orderDownloadId: access.entitlementId,
      supporterId: access.supporterId,
      kind,
    });
    return { allowed: true };
  });
}

function contentDisposition(filename: string, download: boolean): string {
  const safe = filename
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\;\r\n]/g, "_")
    .slice(0, 180);
  return `${download ? "attachment" : "inline"}; filename="${safe || "product"}"`;
}

function copyHeader(source: Headers, target: Headers, name: string) {
  const value = source.get(name);
  if (value) target.set(name, value);
}

function textResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
