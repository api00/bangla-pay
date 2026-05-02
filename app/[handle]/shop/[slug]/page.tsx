import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import CreatorPageFooter from "@/components/creator-page/CreatorPageFooter";
import PublicBuyForm from "@/components/shop/PublicBuyForm";
import { db } from "@/db";
import { getCreatorByHandle } from "@/db/queries/creators";
import { getPublicProduct } from "@/db/queries/products";
import { creatorPages } from "@/db/schema";
import { normalizeHandle, RESERVED_HANDLES } from "@/lib/handle";
import { formatTaka } from "@/lib/money";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ handle: string; slug: string }>;
}

export default async function PublicProductPage({ params }: PageProps) {
  const { handle: rawHandle, slug } = await params;
  const handle = normalizeHandle(rawHandle);
  if (!handle || RESERVED_HANDLES.has(handle)) notFound();

  const creator = await getCreatorByHandle(handle);
  if (!creator) notFound();

  const bundle = await getPublicProduct(creator.id, slug);
  if (!bundle) notFound();
  const { product, files } = bundle;

  const [page] = await db
    .select({ themeColor: creatorPages.themeColor })
    .from(creatorPages)
    .where(eq(creatorPages.creatorId, creator.id))
    .limit(1);
  const themeColor = page?.themeColor ?? "#9fe870";

  const priceCopy =
    product.pricingModel === "free"
      ? "Free"
      : product.pricingModel === "pay_what_you_want"
        ? `From ${formatTaka(product.minPricePaisa ?? product.basePricePaisa)}`
        : formatTaka(product.basePricePaisa);

  return (
    <main className="min-h-screen bg-[#f7f9f5]">
      <div className="max-w-[860px] mx-auto px-5 sm:px-6 py-10 md:py-14">
        <Link
          href={`/${handle}/shop`}
          className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#868685] hover:text-[#0e0f0c]"
        >
          ← {creator.displayName}&rsquo;s shop
        </Link>

        <div className="grid mt-6 gap-8 md:grid-cols-[1.4fr_1fr]">
          <article>
            {product.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.coverUrl}
                alt=""
                className="w-full aspect-[16/9] object-cover rounded-[24px] mb-6 bg-[#f2f6ec] border border-[rgba(14,15,12,0.06)]"
              />
            )}
            <h1
              className="display text-[32px] sm:text-[40px] text-[#0e0f0c]"
              style={{ lineHeight: 1.1, fontWeight: 700 }}
            >
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="mt-3 text-[18px] text-[#454745] leading-[1.5]">
                {product.subtitle}
              </p>
            )}

            {product.descriptionMd && (
              <div className="mt-6 text-[15px] text-[#0e0f0c] leading-[1.65] whitespace-pre-line">
                {product.descriptionMd}
              </div>
            )}

            {files.length > 0 && (
              <div className="mt-8 rounded-2xl border border-[rgba(14,15,12,0.06)] bg-white px-5 py-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#868685] mb-2">
                  What you get
                </p>
                <ul className="space-y-1.5">
                  {files.map((file) => (
                    <li
                      key={file.id}
                      className="text-[14px] text-[#0e0f0c] flex items-center gap-2"
                    >
                      <span aria-hidden>•</span>
                      <span className="truncate">{file.filename}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>

          <aside className="md:sticky md:top-8 md:self-start">
            <div className="rounded-3xl border border-[rgba(14,15,12,0.08)] bg-white p-5 sm:p-6 shadow-[0_2px_0_0_rgba(14,15,12,0.04),0_30px_80px_-40px_rgba(14,15,12,0.18)]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#868685]">
                Price
              </p>
              <p
                className="display mt-2 mb-5 text-[30px] sm:text-[36px] tabular-nums text-[#0e0f0c]"
                style={{ lineHeight: 1, fontWeight: 700 }}
              >
                {priceCopy}
              </p>
              <PublicBuyForm
                handle={handle}
                slug={slug}
                product={product}
                themeColor={themeColor}
              />
            </div>
          </aside>
        </div>

        <div className="mt-10">
          <CreatorPageFooter />
        </div>
      </div>
    </main>
  );
}
