import { and, eq, inArray, or, sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/db";
import { orderDownloads, orderItems, orders } from "@/db/schema";
import { readOrderGrants } from "@/lib/order-grants";
import { createClient } from "@/utils/supabase/server";

interface Params {
  token: string;
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<Params> },
) {
  const { token } = await ctx.params;
  if (!token) {
    return new NextResponse("Invalid link.", { status: 400 });
  }

  const grants = await readOrderGrants();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email && grants.length === 0) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const ownership = [];
  if (user?.email) {
    ownership.push(
      sql`lower(${orders.supporterEmail}) = ${user.email.toLowerCase()}`,
    );
  }
  if (grants.length > 0) ownership.push(inArray(orders.id, grants));

  // Legacy links are recovery pointers only. Buyer identity is still checked,
  // then the private library creates a fresh, short-lived access session.
  const [row] = await db
    .select({
      orderCode: orders.orderCode,
    })
    .from(orderDownloads)
    .innerJoin(orderItems, eq(orderItems.id, orderDownloads.orderItemId))
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(
      and(
        eq(orderDownloads.downloadToken, token),
        eq(orders.status, "paid"),
        or(...ownership),
      ),
    )
    .limit(1);

  if (!row) {
    return new NextResponse("Access not found.", { status: 404 });
  }

  return NextResponse.redirect(
    new URL(`/library/${encodeURIComponent(row.orderCode)}`, request.url),
  );
}
