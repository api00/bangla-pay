import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { orders } from "@/db/schema";

export interface ShopStats {
  paidOrderCount: number;
  shopRevenuePaisa: number;
}

export async function getCreatorShopStats(
  creatorId: string,
): Promise<ShopStats> {
  const [row] = await db
    .select({
      count: sql<number>`COUNT(*)::int`,
      total: sql<number>`COALESCE(SUM(${orders.totalPaisa}), 0)::int`,
    })
    .from(orders)
    .where(and(eq(orders.creatorId, creatorId), eq(orders.status, "paid")));

  return {
    paidOrderCount: Number(row?.count ?? 0),
    shopRevenuePaisa: Number(row?.total ?? 0),
  };
}
