import Link from "next/link";
import { redirect } from "next/navigation";

import { listOrdersForBuyerOrGrants } from "@/db/queries/orders";
import { getAuthedUserOptional } from "@/lib/auth";
import { readOrderGrants } from "@/lib/order-grants";
import { formatTaka } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your library · BanglaPay",
  description: "Read, listen to, and download your purchased products.",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-BD", {
  dateStyle: "medium",
});

export default async function LibraryPage() {
  // A guest buyer has no account, so this page must work from browser grants
  // alone. Only send someone to sign in when there is nothing to show at all.
  const grants = await readOrderGrants();
  const user = await getAuthedUserOptional();
  const email = user?.email?.trim().toLowerCase() ?? null;

  if (!email && grants.length === 0) {
    redirect(`/login?next=${encodeURIComponent("/library")}`);
  }

  const orders = await listOrdersForBuyerOrGrants(email, grants);

  return (
    <main className="min-h-screen bg-[#f7f9f5]">
      <header className="border-b border-[rgba(14,15,12,0.06)] bg-white">
        <div className="mx-auto flex max-w-[920px] items-center justify-between px-5 py-5 sm:px-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
          >
            <span className="display text-2xl tracking-tight">banglapay</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#9fe870]" aria-hidden />
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center text-[13px] font-semibold text-[#454745] hover:text-[#0e0f0c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-[920px] px-5 py-10 sm:px-6 md:py-14">
        <div className="max-w-[620px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#454745]">
            Private library
          </p>
          <h1
            className="display mt-3 text-[36px] text-[#0e0f0c] sm:text-[48px]"
            style={{ lineHeight: 1, fontWeight: 700 }}
          >
            Everything you bought, in one calm place.
          </h1>
          <p className="mt-4 text-[15px] leading-[1.6] text-[#454745]">
            Signed in as {email ?? "your BanglaPay account"}. Open an order to
            read, listen, or download according to the creator&rsquo;s licence.
          </p>
        </div>

        {orders.length > 0 ? (
          <section aria-labelledby="purchases" className="mt-10">
            <h2 id="purchases" className="sr-only">
              Your purchases
            </h2>
            <ul className="overflow-hidden rounded-[24px] border border-[rgba(14,15,12,0.06)] bg-white divide-y divide-[rgba(14,15,12,0.06)]">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/library/${order.orderCode}`}
                    className="grid min-h-20 grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-[#f7f9f5] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#163300] sm:px-6"
                  >
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold text-[#0e0f0c]">
                        Order {order.orderCode}
                      </span>
                      <span className="mt-1 block text-[12px] text-[#454745]">
                        {DATE_FORMAT.format(order.paidAt ?? order.createdAt)} ·{" "}
                        {formatTaka(order.totalPaisa)}
                      </span>
                    </span>
                    <span className="text-[13px] font-semibold text-[#163300]">
                      Open <span aria-hidden>→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="mt-10 rounded-[24px] border border-dashed border-[rgba(14,15,12,0.14)] bg-white px-6 py-10 text-center">
            <h2 className="text-[17px] font-semibold text-[#0e0f0c]">
              Your library is ready for its first product.
            </h2>
            <p className="mx-auto mt-2 max-w-[420px] text-[14px] leading-[1.55] text-[#454745]">
              Buy with this email and the order will appear here after payment.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#163300] px-5 text-[13px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
            >
              Explore BanglaPay
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
