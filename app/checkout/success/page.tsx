import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { creators, orders, tips } from "@/db/schema";
import { ensureLibraryCodeForSupporter } from "@/lib/library-codes";
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

  if (orderId) {
    const [order] = await db
      .select({
        orderCode: orders.orderCode,
        supporterId: orders.supporterId,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (order) {
      if (order.supporterId) {
        await ensureLibraryCodeForSupporter(order.supporterId);
      }
      redirect(`/library/${order.orderCode}?new=1`);
    }
  }
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
    <main className="min-h-screen bg-off-white flex items-center justify-center px-5 sm:px-6 py-10">
      <div className="w-full max-w-[460px] text-center space-y-6">
        <SuccessTick />
        <div className="space-y-2">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gray">
            Tip received
          </p>
          <h1
            className="display text-[36px] sm:text-[44px] text-near-black"
            style={{ lineHeight: 1.05, fontWeight: 700 }}
          >
            Thanks for the cha.
          </h1>
        </div>
        {tipRow ? (
          <p className="text-[15px] text-warm-dark leading-[1.55]">
            You sent{" "}
            <span className="font-semibold text-near-black">
              {formatTaka(tipRow.amountPaisa)}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-near-black">
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
          <p className="text-[15px] text-warm-dark leading-[1.55]">
            Your tip has been received. Thanks for showing up.
          </p>
        )}
        <div className="pt-2">
          <Link
            href={tipRow ? `/${tipRow.handle}` : "/"}
            className="inline-flex h-12 px-6 rounded-full bg-near-black text-white font-semibold text-[14px] items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            {tipRow ? `Back to ${tipRow.displayName}` : "Back to home"}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

function SuccessTick() {
  return (
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wise-green">
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
