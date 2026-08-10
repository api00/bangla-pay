import { and, eq, inArray, or, sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/db";
import {
  mediaAccessTokens,
  orderDownloads,
  orderItems,
  orders,
} from "@/db/schema";
import { createMediaToken } from "@/lib/media-access";
import { readLibrarySupporterGrant } from "@/lib/library-codes";
import { readOrderGrants } from "@/lib/order-grants";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

interface Params {
  downloadId: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> },
) {
  const { downloadId } = await context.params;
  // Authorized by a checkout grant, a Library Code session, or the email used
  // at checkout. Same rule as the private library page.
  const grants = await readOrderGrants();
  const librarySupporterId = await readLibrarySupporterGrant();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email && grants.length === 0 && !librarySupporterId) {
    const libraryUrl = new URL("/library", request.url);
    libraryUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(libraryUrl);
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

  const [entitlement] = await db
    .select({ id: orderDownloads.id })
    .from(orderDownloads)
    .innerJoin(orderItems, eq(orderItems.id, orderDownloads.orderItemId))
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(
      and(
        eq(orderDownloads.id, downloadId),
        eq(orders.status, "paid"),
        or(...ownership),
      ),
    )
    .limit(1);

  if (!entitlement) {
    return new NextResponse("Access not found.", { status: 404 });
  }

  const access = createMediaToken();
  await db.insert(mediaAccessTokens).values({
    orderDownloadId: entitlement.id,
    tokenHash: access.tokenHash,
    expiresAt: access.expiresAt,
  });

  return NextResponse.redirect(
    new URL(`/library/media/${access.token}`, request.url),
  );
}
