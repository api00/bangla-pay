import { eq } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/db";
import { getOrderForSupporter } from "@/db/queries/orders";
import { creators, tips } from "@/db/schema";
import { formatTaka } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Thanks · BanglaPay",
};

interface PageProps {
  searchParams: Promise<{ tip?: string; order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { tip: tipId, order: orderId } = await searchParams;

  if (orderId) return <OrderSuccess orderId={orderId} />;
  return <TipSuccess tipId={tipId} />;
}

async function TipSuccess({ tipId }: { tipId: string | undefined }) {
  let tipRow: {
    amountPaisa: number;
    handle: string;
    displayName: string;
    chaCount: number | null;
  } | null = null;

  if (tipId) {
    const [row] = await db
      .select({
        amountPaisa: tips.amountPaisa,
        chaCount: tips.chaCount,
        handle: creators.handle,
        displayName: creators.displayName,
      })
      .from(tips)
      .innerJoin(creators, eq(tips.creatorId, creators.id))
      .where(eq(tips.id, tipId))
      .limit(1);
    if (row) tipRow = row;
  }

  return (
    <main className="min-h-screen bg-[#f7f9f5] flex items-center justify-center px-5 sm:px-6 py-10">
      <div className="w-full max-w-[460px] text-center space-y-6">
        <SuccessTick />
        <div className="space-y-2">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#868685]">
            Tip received
          </p>
          <h1
            className="display text-[36px] sm:text-[44px] text-[#0e0f0c]"
            style={{ lineHeight: 1.05, fontWeight: 700 }}
          >
            Thanks for the cha.
          </h1>
        </div>
        {tipRow ? (
          <p className="text-[15px] text-[#454745] leading-[1.55]">
            You sent{" "}
            <span className="font-semibold text-[#0e0f0c]">
              {formatTaka(tipRow.amountPaisa)}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[#0e0f0c]">
              {tipRow.displayName}
            </span>
            .
            {tipRow.chaCount && (
              <>
                {" "}
                That&rsquo;s {tipRow.chaCount} cha &mdash; they&rsquo;re going
                to feel this one. ☕
              </>
            )}
          </p>
        ) : (
          <p className="text-[15px] text-[#454745] leading-[1.55]">
            Your tip has been received. Thanks for showing up.
          </p>
        )}
        <div className="pt-2">
          <Link
            href={tipRow ? `/${tipRow.handle}` : "/"}
            className="inline-flex h-12 px-6 rounded-full bg-[#0e0f0c] text-white font-semibold text-[14px] items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            {tipRow ? `Back to ${tipRow.displayName}` : "Back to home"}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

async function OrderSuccess({ orderId }: { orderId: string }) {
  const detail = await getOrderForSupporter(orderId);
  if (!detail) {
    return (
      <main className="min-h-screen bg-[#f7f9f5] flex items-center justify-center px-5 sm:px-6 py-10">
        <p className="text-[14px] text-[#454745]">
          We couldn&rsquo;t find that order.
        </p>
      </main>
    );
  }
  const { order, items, downloads } = detail;
  const [creator] = await db
    .select({ handle: creators.handle, displayName: creators.displayName })
    .from(creators)
    .where(eq(creators.id, order.creatorId))
    .limit(1);

  return (
    <main className="min-h-screen bg-[#f7f9f5] flex items-start justify-center px-5 sm:px-6 py-10 md:py-16">
      <div className="w-full max-w-[520px] space-y-6">
        <div className="text-center space-y-4">
          <SuccessTick />
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#868685]">
            Order received
          </p>
          <h1
            className="display text-[32px] sm:text-[40px] text-[#0e0f0c]"
            style={{ lineHeight: 1.05, fontWeight: 700 }}
          >
            Your files are ready.
          </h1>
          <p className="text-[14px] text-[#454745] leading-[1.55]">
            We sent a copy of these links to{" "}
            <span className="font-semibold text-[#0e0f0c]">
              {order.supporterEmail}
            </span>
            .
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-[rgba(14,15,12,0.06)] p-6 space-y-4">
          {items.map((row) => (
            <div key={row.item.id}>
              <p className="text-[14px] font-semibold text-[#0e0f0c]">
                {row.item.productTitleSnapshot}
              </p>
              <ul className="mt-2 space-y-2">
                {downloads
                  .filter((d) => d.item.id === row.item.id)
                  .map((d) => (
                    <li
                      key={d.download.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[rgba(14,15,12,0.06)] bg-[#f7f9f5]"
                    >
                      <span className="text-[13px] text-[#0e0f0c] truncate">
                        {d.file.filename}
                      </span>
                      <Link
                        href={`/d/${d.download.downloadToken}`}
                        className="inline-flex items-center justify-center h-9 px-4 rounded-full bg-[#9fe870] text-[#163300] text-[12px] font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform"
                      >
                        Download
                      </Link>
                    </li>
                  ))}
                {downloads.filter((d) => d.item.id === row.item.id).length ===
                  0 && (
                  <li className="text-[12px] text-[#868685] italic">
                    No downloadable files yet — the creator will follow up.
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href={creator ? `/${creator.handle}` : "/"}
            className="inline-flex h-11 px-5 rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white text-[#0e0f0c] font-semibold text-[13px] items-center justify-center gap-2 hover:border-[#0e0f0c] transition-colors"
          >
            Back to {creator?.displayName ?? "creator"}
          </Link>
        </div>
      </div>
    </main>
  );
}

function SuccessTick() {
  return (
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#9fe870]">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#163300"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </div>
  );
}
