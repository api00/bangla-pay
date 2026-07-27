import Link from "next/link";

import { listOrdersForCreator } from "@/db/queries/orders";
import { requireCreator } from "@/lib/auth";
import { formatTaka } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Orders · BanglaPay",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-BD", {
  dateStyle: "medium",
  timeStyle: "short",
});

const STATUS_STYLES: Record<
  "pending" | "paid" | "failed" | "refunded",
  string
> = {
  paid: "bg-light-mint text-dark-green",
  pending: "bg-warning-surface text-warning-ink",
  failed: "bg-danger-surface text-heritage-red-ink",
  refunded: "bg-light-surface text-warm-dark",
};

export default async function DashboardOrdersPage() {
  const { creator } = await requireCreator();
  const orders = await listOrdersForCreator(creator.id, 100);

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <h1
            className="display text-[28px] md:text-[36px] text-near-black"
            style={{ lineHeight: 1.1, fontWeight: 700 }}
          >
            Orders
          </h1>
          <p className="text-[14px] text-warm-dark mt-1">
            Shop purchases from your supporters.
          </p>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[rgba(14,15,12,0.14)] bg-white px-8 py-12 text-center">
          <p className="text-[16px] font-semibold text-near-black">
            No orders yet.
          </p>
          <p className="mt-1 text-[14px] text-warm-dark leading-[1.55] max-w-[400px] mx-auto">
            Once your shop has products, purchases show up here with download
            status.
          </p>
        </div>
      ) : (
        <section className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] overflow-hidden">
          <ul className="divide-y divide-[rgba(14,15,12,0.05)]">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-4 hover:bg-off-white transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-semibold text-near-black truncate">
                        {order.supporterName ?? "Anonymous"}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-full ${
                          STATUS_STYLES[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray truncate">
                      {order.supporterEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-semibold tabular-nums text-near-black">
                      {formatTaka(order.totalPaisa)}
                    </div>
                    <div className="text-[11px] text-gray tabular-nums">
                      {DATE_FORMAT.format(order.createdAt)}
                    </div>
                  </div>
                  <span className="text-[12px] font-semibold text-warm-dark">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
