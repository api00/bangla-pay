import Link from "next/link";
import { notFound } from "next/navigation";

import { getOrderForCreator } from "@/db/queries/orders";
import { requireCreator } from "@/lib/auth";
import { formatTaka } from "@/lib/money";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-BD", {
  dateStyle: "long",
  timeStyle: "short",
});

export default async function DashboardOrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;
  const { creator } = await requireCreator();
  const detail = await getOrderForCreator(creator.id, orderId);
  if (!detail) notFound();
  const { order, items, downloads } = detail;

  return (
    <div className="space-y-6 max-w-[820px]">
      <header>
        <Link
          href="/dashboard/orders"
          className="text-[13px] font-semibold text-[#454745] hover:text-[#0e0f0c]"
        >
          ← Back to orders
        </Link>
        <h1
          className="display mt-3 text-[28px] md:text-[34px] text-[#0e0f0c]"
          style={{ lineHeight: 1.1, fontWeight: 700 }}
        >
          {formatTaka(order.totalPaisa)}{" "}
          <span className="text-[#454745]">order</span>
        </h1>
        <p className="text-[13px] text-[#868685] mt-1 tabular-nums">
          {DATE_FORMAT.format(order.createdAt)}
        </p>
      </header>

      <section className="rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] p-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#868685]">
            Supporter
          </p>
          <p className="text-[15px] font-semibold text-[#0e0f0c] mt-1">
            {order.supporterName ?? "Anonymous"}
          </p>
          <p className="text-[13px] text-[#454745] mt-0.5">
            {order.supporterEmail}
          </p>
        </div>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#868685]">
            Status
          </p>
          <p className="text-[15px] font-semibold text-[#0e0f0c] mt-1 capitalize">
            {order.status}
          </p>
          {order.paidAt && (
            <p className="text-[13px] text-[#454745] mt-0.5 tabular-nums">
              Paid {DATE_FORMAT.format(order.paidAt)}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] p-6">
        <h2 className="text-[14px] font-semibold text-[#0e0f0c] mb-4">
          Items
        </h2>
        <ul className="divide-y divide-[rgba(14,15,12,0.05)]">
          {items.map((row) => (
            <li
              key={row.item.id}
              className="py-3 first:pt-0 last:pb-0 flex justify-between items-baseline gap-3"
            >
              <span className="text-[14px] text-[#0e0f0c] truncate">
                {row.item.productTitleSnapshot}
              </span>
              <span className="text-[13px] tabular-nums text-[#454745] shrink-0">
                {row.item.quantity > 1 && `${row.item.quantity} × `}
                {formatTaka(row.item.unitPricePaisa)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {downloads.length > 0 && (
        <section className="rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] p-6">
          <h2 className="text-[14px] font-semibold text-[#0e0f0c] mb-4">
            Downloads
          </h2>
          <ul className="space-y-2">
            {downloads.map((d) => (
              <li
                key={d.download.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[rgba(14,15,12,0.06)] bg-[#f7f9f5]"
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#0e0f0c] truncate">
                    {d.file.filename}
                  </p>
                  <p className="text-[11px] text-[#868685] tabular-nums">
                    Used {d.download.downloadsUsed}× · expires{" "}
                    {DATE_FORMAT.format(d.download.expiresAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
