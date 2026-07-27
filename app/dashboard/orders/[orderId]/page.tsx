import Link from "next/link";
import { notFound } from "next/navigation";

import { getOrderForCreator } from "@/db/queries/orders";
import { requireCreator } from "@/lib/auth";
import { formatTaka } from "@/lib/money";
import { getDeliveryMode } from "@/lib/product-catalog";

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
  const { order, items, downloads, accessEvents } = detail;

  return (
    <div className="space-y-6 max-w-[820px]">
      <header>
        <Link
          href="/dashboard/orders"
          className="text-[13px] font-semibold text-warm-dark hover:text-near-black"
        >
          ← Back to orders
        </Link>
        <h1
          className="display mt-3 text-[28px] md:text-[34px] text-near-black"
          style={{ lineHeight: 1.1, fontWeight: 700 }}
        >
          {formatTaka(order.totalPaisa)}{" "}
          <span className="text-warm-dark">order</span>
        </h1>
        <p className="text-[13px] text-gray mt-1 tabular-nums">
          {DATE_FORMAT.format(order.createdAt)}
        </p>
      </header>

      <section className="rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] p-6 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gray">
            Supporter
          </p>
          <p className="text-[15px] font-semibold text-near-black mt-1">
            {order.supporterName ?? "Anonymous"}
          </p>
          <p className="text-[13px] text-warm-dark mt-0.5">
            {order.supporterEmail}
          </p>
        </div>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gray">
            Order code
          </p>
          <p className="mt-1 text-[15px] font-semibold tabular-nums text-near-black">
            {order.orderCode}
          </p>
          <p className="mt-0.5 text-[13px] text-warm-dark">
            {order.licenseAcceptedAt
              ? "Personal licence accepted"
              : "Legacy order · no licence record"}
          </p>
        </div>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gray">
            Status
          </p>
          <p className="text-[15px] font-semibold text-near-black mt-1 capitalize">
            {order.status}
          </p>
          {order.paidAt && (
            <p className="text-[13px] text-warm-dark mt-0.5 tabular-nums">
              Paid {DATE_FORMAT.format(order.paidAt)}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] p-6">
        <h2 className="text-[14px] font-semibold text-near-black mb-4">
          Items
        </h2>
        <ul className="divide-y divide-[rgba(14,15,12,0.05)]">
          {items.map((row) => (
            <li
              key={row.item.id}
              className="py-3 first:pt-0 last:pb-0 flex justify-between items-baseline gap-3"
            >
              <span className="text-[14px] text-near-black truncate">
                {row.item.productTitleSnapshot}
              </span>
              <span className="text-[13px] tabular-nums text-warm-dark shrink-0">
                {row.item.quantity > 1 && `${row.item.quantity} × `}
                {formatTaka(row.item.unitPricePaisa)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {downloads.length > 0 && (
        <section className="rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] p-6">
          <h2 className="text-[14px] font-semibold text-near-black mb-4">
            Buyer access
          </h2>
          <ul className="space-y-2">
            {downloads.map((d) => (
              <li
                key={d.download.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[rgba(14,15,12,0.06)] bg-off-white"
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-near-black truncate">
                    {d.file.filename}
                  </p>
                  <p className="text-[11px] text-gray tabular-nums">
                    {getDeliveryMode(d.download.accessMode).label}
                    {d.download.accessMode === "download" &&
                      ` · downloaded ${d.download.downloadsUsed}×`}
                    {" · "}
                    {
                      accessEvents.filter(
                        (event) =>
                          event.orderDownloadId === d.download.id,
                      ).length
                    }{" "}
                    access event(s)
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {accessEvents.length > 0 && (
        <section className="rounded-[24px] bg-white border border-[rgba(14,15,12,0.06)] p-6">
          <h2 className="text-[14px] font-semibold text-near-black mb-4">
            Access activity
          </h2>
          <ul className="divide-y divide-[rgba(14,15,12,0.05)]">
            {accessEvents.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="text-[14px] font-semibold capitalize text-near-black">
                  {event.kind}
                </span>
                <span className="text-[12px] tabular-nums text-warm-dark">
                  {DATE_FORMAT.format(event.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
