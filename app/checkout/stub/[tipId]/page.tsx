import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { creators, tips } from "@/db/schema";
import { formatTaka } from "@/lib/money";

import StubCheckoutButtons from "./StubCheckoutButtons";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ tipId: string }>;
}

export default async function StubCheckoutPage({ params }: PageProps) {
  const { tipId } = await params;

  const [row] = await db
    .select({
      tipId: tips.id,
      amountPaisa: tips.amountPaisa,
      message: tips.message,
      supporterName: tips.supporterName,
      status: tips.status,
      handle: creators.handle,
      displayName: creators.displayName,
    })
    .from(tips)
    .innerJoin(creators, eq(tips.creatorId, creators.id))
    .where(eq(tips.id, tipId))
    .limit(1);

  if (!row) notFound();
  if (row.status !== "pending") {
    // Already settled — show success route as the canonical post-payment surface.
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f7f9f5] flex flex-col">
      <header className="px-6 md:px-10 py-6 flex items-center justify-between border-b border-[rgba(14,15,12,0.06)] bg-white">
        <Link
          href={`/${row.handle}`}
          className="inline-flex items-center gap-1.5"
          aria-label="BanglaPay home"
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
              You&rsquo;re sending
            </p>
            <p
              className="display mt-2 text-[44px] sm:text-[56px] tabular-nums text-[#0e0f0c]"
              style={{ lineHeight: 1, fontWeight: 700 }}
            >
              {formatTaka(row.amountPaisa)}
            </p>
            <p className="mt-3 text-[14px] text-[#454745]">
              to{" "}
              <span className="font-semibold text-[#0e0f0c]">
                {row.displayName}
              </span>
              <span className="text-[#868685]"> (@{row.handle})</span>
            </p>

            {row.message && (
              <div className="mt-6 pt-5 border-t border-[rgba(14,15,12,0.06)]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#868685] mb-2">
                  Your note
                </p>
                <p className="text-[14px] text-[#0e0f0c] leading-[1.55] whitespace-pre-line">
                  {row.message}
                </p>
                {row.supporterName && (
                  <p className="text-[12px] text-[#868685] mt-2">
                    — {row.supporterName}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white border border-dashed border-[rgba(14,15,12,0.12)] px-5 py-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#868685] mb-1">
              Sandbox mode
            </p>
            <p className="text-[13px] text-[#454745] leading-[1.55]">
              Real bKash, Nagad, and card checkout are launching with our first
              payment provider. Use the buttons below to simulate the
              experience.
            </p>
          </div>

          <StubCheckoutButtons tipId={row.tipId} handle={row.handle} />
        </div>
      </div>
    </main>
  );
}
