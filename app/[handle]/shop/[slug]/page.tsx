import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import CreatorPageFooter from "@/components/creator-page/CreatorPageFooter";
import ProductCategoryBadge from "@/components/shop/ProductCategoryBadge";
import ProductFilesPreview from "@/components/shop/ProductFilesPreview";
import ProductGallery from "@/components/shop/ProductGallery";
import PublicBuyForm from "@/components/shop/PublicBuyForm";
import { db } from "@/db";
import { getCreatorByHandle } from "@/db/queries/creators";
import { getPublicProduct } from "@/db/queries/products";
import { creatorPages } from "@/db/schema";
import { normalizeHandle, RESERVED_HANDLES } from "@/lib/handle";
import { formatTaka } from "@/lib/money";
import { getDeliveryMode } from "@/lib/product-catalog";

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
  const delivery = getDeliveryMode(product.deliveryMode);

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
            {(product.galleryUrls?.length ?? 0) > 0 ? (
              <ProductGallery
                images={product.galleryUrls ?? []}
                alt={product.title}
              />
            ) : (
              product.coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.coverUrl}
                  alt=""
                  className="w-full aspect-[16/9] object-cover rounded-[24px] mb-6 bg-[#f2f6ec] border border-[rgba(14,15,12,0.06)]"
                />
              )
            )}
            {product.category && (
              <div className="mb-4 flex flex-wrap gap-2">
                <ProductCategoryBadge category={product.category} />
                <span className="inline-flex min-h-7 items-center rounded-full border border-[rgba(14,15,12,0.1)] bg-white px-3 text-[12px] font-semibold text-[#454745]">
                  {delivery.label}
                </span>
              </div>
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

            <ProductFilesPreview files={files} />

            <section
              aria-labelledby="product-rights"
              className="mt-6 rounded-[20px] border border-[rgba(14,15,12,0.08)] bg-[#f7f9f5] p-5"
            >
              <div className="flex items-start gap-3">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-0.5 h-6 w-6 shrink-0 text-[#163300]"
                >
                  <path
                    d="M12 3 5 6v5c0 4.7 2.9 8 7 10 4.1-2 7-5.3 7-10V6l-7-3Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <h2
                    id="product-rights"
                    className="text-[16px] font-semibold text-[#0e0f0c]"
                  >
                    Creator rights and your licence
                  </h2>
                  <p className="mt-1 text-[14px] leading-[1.6] text-[#454745]">
                    {product.rightsConfirmedAt
                      ? "The creator has confirmed that they made this product or have permission to sell it. "
                      : ""}
                    Your purchase gives you personal access through{" "}
                    {delivery.label}. Copyright stays with the creator unless
                    this description clearly grants a different licence.
                  </p>
                  <Link
                    href="/copyright"
                    className="mt-3 inline-flex min-h-11 items-center font-semibold text-[13px] text-[#163300] underline decoration-[#9fe870] decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]"
                  >
                    Read BanglaPay&rsquo;s copyright policy
                  </Link>
                </div>
              </div>
            </section>
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
