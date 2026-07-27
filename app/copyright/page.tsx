import type { Metadata } from "next";
import Link from "next/link";

import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Copyright and digital products · BanglaPay",
  description:
    "What BanglaPay digital products are, who owns them, and how creators and buyers should use them.",
};

const categories = [
  {
    name: "E-books & guides",
    formats: "PDF, EPUB, and ZIP bundles",
  },
  {
    name: "Audio products",
    formats: "MP3, WAV, M4A, and ZIP bundles",
  },
  {
    name: "Design & image packs",
    formats: "PNG, JPG, WebP, SVG, and ZIP bundles",
  },
];

export default function CopyrightPage() {
  return (
    <main className="min-h-screen bg-off-white text-near-black">
      <div className="mx-auto max-w-[860px] px-5 py-8 sm:px-6 md:py-12">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green"
            aria-label="BanglaPay home"
          >
            <span className="display text-2xl tracking-tight">banglapay</span>
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-wise-green"
            />
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-[14px] font-semibold text-dark-green underline decoration-wise-green decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green"
          >
            Back to home
          </Link>
        </header>

        <article className="mt-14 md:mt-20">
          <header className="max-w-[720px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-warm-dark">
              Copyright and digital products
            </p>
            <h1
              className="display mt-4 text-[38px] text-near-black sm:text-[52px] md:text-[64px]"
              style={{ lineHeight: 1.02, fontWeight: 900 }}
            >
              Your work stays yours.
            </h1>
            <p className="mt-6 max-w-[680px] text-[17px] leading-[1.65] text-warm-dark md:text-[19px]">
              BanglaPay helps creators sell original files directly. Buyers
              receive the access or licence described on the product page;
              copyright ownership does not transfer automatically.
            </p>
          </header>

          <section
            aria-labelledby="digital-product-definition"
            className="mt-14 border-t border-[rgba(14,15,12,0.12)] pt-10"
          >
            <h2
              id="digital-product-definition"
              className="text-[24px] font-semibold tracking-tight md:text-[28px]"
            >
              What is a digital product?
            </h2>
            <p className="mt-3 max-w-[680px] text-[16px] leading-[1.65] text-warm-dark">
              It is an original file delivered online after purchase, similar
              to buying an e-book for Kindle or listening to music distributed
              through Spotify—but sold directly by the creator.
            </p>
            <dl className="mt-6 grid gap-3 sm:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="rounded-2xl border border-[rgba(14,15,12,0.08)] bg-white p-4"
                >
                  <dt className="text-[15px] font-semibold text-near-black">
                    {category.name}
                  </dt>
                  <dd className="mt-1 text-[13px] leading-[1.5] text-warm-dark">
                    {category.formats}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            aria-labelledby="creator-responsibility"
            className="mt-12 border-t border-[rgba(14,15,12,0.12)] pt-10"
          >
            <h2
              id="creator-responsibility"
              className="text-[24px] font-semibold tracking-tight md:text-[28px]"
            >
              The creator&rsquo;s responsibility
            </h2>
            <p className="mt-3 max-w-[680px] text-[16px] leading-[1.65] text-warm-dark">
              Before publishing, every creator must confirm that they made the
              product or have permission or a licence to sell and distribute
              it. Uploading copied, pirated, or unauthorized work is not
              allowed.
            </p>
          </section>

          <section
            aria-labelledby="buyer-licence"
            className="mt-12 border-t border-[rgba(14,15,12,0.12)] pt-10"
          >
            <h2
              id="buyer-licence"
              className="text-[24px] font-semibold tracking-tight md:text-[28px]"
            >
              What buyers may do
            </h2>
            <p className="mt-3 max-w-[680px] text-[16px] leading-[1.65] text-warm-dark">
              Unless the product description grants broader permission, a
              purchase is for the buyer&rsquo;s personal use. Buyers may not
              redistribute, upload, copy for others, or resell the files.
            </p>
          </section>

          <section
            aria-labelledby="access-protection"
            className="mt-12 border-t border-[rgba(14,15,12,0.12)] pt-10"
          >
            <h2
              id="access-protection"
              className="text-[24px] font-semibold tracking-tight md:text-[28px]"
            >
              How BanglaPay protects delivery
            </h2>
            <p className="mt-3 max-w-[680px] text-[16px] leading-[1.65] text-warm-dark">
              Product files stay in private storage and are delivered through
              expiring, limited-use download links. These controls discourage
              casual sharing, but no platform can technically guarantee that a
              determined buyer will never copy a downloaded file.
            </p>
          </section>

          <section
            aria-labelledby="report-infringement"
            className="mt-12 border-t border-[rgba(14,15,12,0.12)] pt-10"
          >
            <h2
              id="report-infringement"
              className="text-[24px] font-semibold tracking-tight md:text-[28px]"
            >
              Report suspected infringement
            </h2>
            <p className="mt-3 max-w-[680px] text-[16px] leading-[1.65] text-warm-dark">
              If a BanglaPay product appears to use your work without
              permission, email the product URL, a description of your work,
              and evidence that you own or represent the rights.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Copyright%20report`}
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-dark-green px-6 text-[15px] font-semibold text-white transition-colors hover:bg-positive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green"
            >
              Email {SUPPORT_EMAIL}
            </a>
          </section>
        </article>

        <footer className="mt-16 border-t border-[rgba(14,15,12,0.12)] py-8 text-[13px] text-warm-dark">
          © BanglaPay · Last updated July 26, 2026
        </footer>
      </div>
    </main>
  );
}
