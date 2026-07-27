import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { getPaidOrderByCode } from "@/db/queries/orders";
import { creators } from "@/db/schema";
import { requireLibraryUser } from "@/lib/auth";
import { hasOrderGrant } from "@/lib/order-grants";
import { formatTaka } from "@/lib/money";
import { getDeliveryMode } from "@/lib/product-catalog";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ orderCode: string }>;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-BD", {
  dateStyle: "long",
  timeStyle: "short",
});

export default async function OrderLibraryPage({ params }: PageProps) {
  const { orderCode } = await params;
  const nextPath = `/library/${encodeURIComponent(orderCode)}`;

  // Two ways in, checked before any sign-in wall:
  //  1. this browser completed the checkout (cookie grant), or
  //  2. the visitor is signed in with the email used at checkout.
  // Without (1) a buyer who typed an email they cannot log in as would be
  // permanently locked out of something they already paid for.
  const detail = await getPaidOrderByCode(orderCode);
  if (!detail) notFound();

  const granted = await hasOrderGrant(detail.order.id);

  if (!granted) {
    const user = await requireLibraryUser(nextPath);
    const email = user.email?.trim().toLowerCase();
    if (email !== detail.order.supporterEmail.trim().toLowerCase()) {
      return <WrongAccount orderEmail={detail.order.supporterEmail} />;
    }
  }

  const { order, items, downloads } = detail;

  const [creator] = await db
    .select({ handle: creators.handle, displayName: creators.displayName })
    .from(creators)
    .where(eq(creators.id, order.creatorId))
    .limit(1);

  return (
    <main className="min-h-screen bg-[#f7f9f5]">
      <header className="border-b border-[rgba(14,15,12,0.06)] bg-white">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-5 py-5 sm:px-6">
          <Link
            href="/library"
            className="inline-flex min-h-11 items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
          >
            <span className="display text-2xl tracking-tight">banglapay</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#9fe870]" aria-hidden />
          </Link>
          <Link
            href="/library"
            className="inline-flex min-h-11 items-center text-[13px] font-semibold text-[#454745] hover:text-[#0e0f0c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
          >
            ← All purchases
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1080px] px-5 py-9 sm:px-6 md:py-12">
        <header className="border-b border-[rgba(14,15,12,0.08)] pb-7">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#454745]">
            Paid · {order.orderCode}
          </p>
          <h1
            className="display mt-3 text-[34px] text-[#0e0f0c] sm:text-[44px]"
            style={{ lineHeight: 1.05, fontWeight: 700 }}
          >
            Your private purchase.
          </h1>
          <p className="mt-3 text-[14px] leading-[1.6] text-[#454745]">
            Purchased from{" "}
            <span className="font-semibold text-[#0e0f0c]">
              {creator?.displayName ?? "a BanglaPay creator"}
            </span>{" "}
            for {formatTaka(order.totalPaisa)} on{" "}
            {DATE_FORMAT.format(order.paidAt ?? order.createdAt)}.
          </p>
        </header>

        <div className="mt-8 space-y-10">
          {items.map(({ item }) => {
            const itemAccess = downloads.filter(
              (entry) => entry.item.id === item.id,
            );
            const accessMode = itemAccess[0]?.download.accessMode ?? "download";
            const delivery = getDeliveryMode(accessMode);

            return (
              <section key={item.id} aria-labelledby={`item-${item.id}`}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#454745]">
                      {delivery.label}
                    </p>
                    <h2
                      id={`item-${item.id}`}
                      className="mt-1 text-[22px] font-semibold leading-[1.25] text-[#0e0f0c]"
                    >
                      {item.productTitleSnapshot}
                    </h2>
                  </div>
                  <span className="rounded-full border border-[rgba(22,51,0,0.12)] bg-[#e2f6d5] px-3 py-1.5 text-[12px] font-semibold text-[#163300]">
                    Personal licence
                  </span>
                </div>

                {itemAccess.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {itemAccess.map(({ download, file }) => (
                      <LibraryAccess
                        key={download.id}
                        entitlementId={download.id}
                        filename={file.filename}
                        mimeType={file.mimeType}
                        accessMode={download.accessMode}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 rounded-2xl border border-dashed border-[rgba(14,15,12,0.14)] bg-white p-5 text-[14px] text-[#454745]">
                    The creator has not attached a file to this product yet.
                  </p>
                )}
              </section>
            );
          })}
        </div>

        <footer className="mt-12 border-t border-[rgba(14,15,12,0.08)] pt-6 text-[12px] leading-[1.6] text-[#454745]">
          Access is limited to the buyer account for this order. BanglaPay uses
          short-lived links and records access events to protect creator rights.{" "}
          <Link
            href="/copyright"
            className="font-semibold text-[#163300] underline decoration-[#9fe870] decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
          >
            Licence details
          </Link>
          {creator && (
            <>
              {" "}
              ·{" "}
              <Link
                href={`/${creator.handle}`}
                className="font-semibold text-[#163300] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
              >
                Visit {creator.displayName}
              </Link>
            </>
          )}
        </footer>
      </div>
    </main>
  );
}

interface LibraryAccessProps {
  entitlementId: string;
  filename: string;
  mimeType: string;
  accessMode: "view_only" | "stream_only" | "download";
}

function LibraryAccess({
  entitlementId,
  filename,
  mimeType,
  accessMode,
}: LibraryAccessProps) {
  const accessHref = `/library/access/${entitlementId}`;

  if (accessMode === "view_only") {
    return (
      <div className="overflow-hidden rounded-[20px] border border-[rgba(14,15,12,0.1)] bg-white">
        <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[rgba(14,15,12,0.08)] px-4">
          <p className="truncate text-[13px] font-semibold text-[#0e0f0c]">
            {filename}
          </p>
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#454745]">
            View only
          </span>
        </div>
        <iframe
          src={accessHref}
          title={`Read ${filename}`}
          // Chrome refuses to start its PDF viewer inside a sandboxed frame
          // without allow-scripts and blocks the frame outright. Downloads and
          // popups remain disallowed, so view-only still cannot save the file.
          sandbox="allow-same-origin allow-scripts"
          className="h-[70vh] min-h-[520px] w-full bg-[#e8ebe6]"
        />
      </div>
    );
  }

  if (accessMode === "stream_only") {
    return (
      <div className="rounded-[20px] border border-[rgba(14,15,12,0.1)] bg-white p-5">
        <p className="text-[14px] font-semibold text-[#0e0f0c]">{filename}</p>
        <p className="mt-1 text-[12px] text-[#454745]">
          Stream-only audio · {mimeType}
        </p>
        <audio
          controls
          controlsList="nodownload"
          preload="metadata"
          src={accessHref}
          className="mt-4 w-full"
          aria-label={`Listen to ${filename}`}
        >
          Your browser does not support audio playback.
        </audio>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[rgba(14,15,12,0.1)] bg-white p-5">
      <div className="min-w-0">
        <p className="truncate text-[14px] font-semibold text-[#0e0f0c]">
          {filename}
        </p>
        <p className="mt-1 text-[12px] text-[#454745]">
          Original file · personal-use licence
        </p>
      </div>
      <Link
        href={accessHref}
        className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-[#9fe870] px-5 text-[13px] font-semibold text-[#163300] transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300] motion-reduce:transform-none"
      >
        Download file
      </Link>
    </div>
  );
}

/**
 * Shown when someone is signed in as a different account than the one used at
 * checkout. Deliberately not a 404: the order is real, the visitor simply
 * needs the right identity. The email is masked so an order code alone never
 * discloses a buyer's full address.
 */
function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  const head = local.slice(0, 2);
  return `${head}${"•".repeat(Math.max(local.length - 2, 1))}@${domain}`;
}

function WrongAccount({ orderEmail }: { orderEmail: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9f5] px-5 py-10 sm:px-6">
      <div className="w-full max-w-[460px] space-y-5 text-center">
        <h1
          className="display text-[30px] text-[#0e0f0c] sm:text-[38px]"
          style={{ lineHeight: 1.05, fontWeight: 700 }}
        >
          Signed in as the wrong account.
        </h1>
        <p className="text-[15px] leading-[1.6] text-[#454745]">
          This purchase belongs to{" "}
          <span className="font-semibold text-[#0e0f0c]">
            {maskEmail(orderEmail)}
          </span>
          . Sign in with that email to open it.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#0e0f0c] px-6 text-[14px] font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] motion-reduce:transform-none"
            >
              Switch account
            </button>
          </form>
          <Link
            href="/library"
            className="inline-flex h-12 items-center justify-center rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-5 text-[14px] font-semibold text-[#0e0f0c] transition-colors hover:border-[#0e0f0c]"
          >
            Your library
          </Link>
        </div>
      </div>
    </main>
  );
}
