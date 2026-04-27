import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { creators, orderItems, orders } from "@/db/schema";
import { formatTaka } from "@/lib/money";

import StubOrderButtons from "./StubOrderButtons";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function StubOrderCheckoutPage({ params }: PageProps) {
  const { orderId } = await params;

  const [orderRow] = await db
    .select({
      orderId: orders.id,
      totalPaisa: orders.totalPaisa,
      supporterEmail: orders.supporterEmail,
      status: orders.status,
      handle: creators.handle,
      displayName: creators.displayName,
    })
    .from(orders)
    .innerJoin(creators, eq(orders.creatorId, creators.id))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!orderRow) notFound();
  if (orderRow.status !== "pending") notFound();

  const items = await db
    .select({
      title: orderItems.productTitleSnapshot,
      unitPricePaisa: orderItems.unitPricePaisa,
      quantity: orderItems.quantity,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return (
    <main className="min-h-screen bg-[#f7f9f5] flex flex-col">
      <header className="px-6 md:px-10 py-6 flex items-center justify-between border-b border-[rgba(14,15,12,0.06)] bg-white">
        <Link
          href={`/${orderRow.handle}/shop`}
          className="inline-flex items-center gap-1.5"
        >
          <span className="display text-2xl tracking-tight">banglapay</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#9fe870]" aria-hidden />
        </Link>
        <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#868685]">
          Test checkout
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-5 sm:px-6 py-10 md:py-16">
        <div className="w-full max-w-[480px] space-y-6">
          <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-8 shadow-[0_2px_0_0_rgba(14,15,12,0.04),0_30px_80px_-40px_rgba(14,15,12,0.18)]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#868685]">
              Total
            </p>
            <p
              className="display mt-2 text-[44px] sm:text-[56px] tabular-nums text-[#0e0f0c]"
              style={{ lineHeight: 1, fontWeight: 700 }}
            >
              {orderRow.totalPaisa === 0
                ? "Free"
                : formatTaka(orderRow.totalPaisa)}
            </p>
            <p className="mt-2 text-[14px] text-[#454745]">
              from{" "}
              <span className="font-semibold text-[#0e0f0c]">
                {orderRow.displayName}
              </span>
              <span className="text-[#868685]"> (@{orderRow.handle})</span>
            </p>

            <div className="mt-6 pt-5 border-t border-[rgba(14,15,12,0.06)] space-y-2">
              {items.map((item, idx) => (
                <div
                  key={`${item.title}-${idx}`}
                  className="flex justify-between gap-3 text-[14px]"
                >
                  <span className="text-[#0e0f0c] truncate">{item.title}</span>
                  <span className="text-[#454745] tabular-nums shrink-0">
                    {item.quantity > 1 ? `${item.quantity} × ` : ""}
                    {formatTaka(item.unitPricePaisa)}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-5 pt-5 border-t border-[rgba(14,15,12,0.06)] text-[12px] text-[#868685]">
              Receipt &amp; downloads will be available on the next page after
              payment.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-dashed border-[rgba(14,15,12,0.12)] px-5 py-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#868685] mb-1">
              Sandbox mode
            </p>
            <p className="text-[13px] text-[#454745] leading-[1.55]">
              Real payment provider is launching soon. Use the buttons below to
              simulate.
            </p>
          </div>

          <StubOrderButtons
            orderId={orderRow.orderId}
            cancelHref={`/${orderRow.handle}/shop`}
          />
        </div>
      </div>
    </main>
  );
}
