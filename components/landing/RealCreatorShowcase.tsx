import Link from "next/link";

import CreatorCard from "@/components/creators/CreatorCard";
import { listDirectoryCreators } from "@/db/queries/creators";

/**
 * Real creators on the landing page.
 *
 * Replaces a hardcoded array of invented people. Showing fabricated creators
 * on a live marketing page is the kind of thing that quietly becomes a
 * credibility problem, and it also hid the fact that the directory query did
 * not exist yet.
 *
 * Renders nothing at all when no creator qualifies — an empty grid under a
 * confident heading is worse than simply not showing the section.
 */
export default async function RealCreatorShowcase() {
  const creators = await listDirectoryCreators(6);
  if (creators.length === 0) return null;

  return (
    <section id="creators" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-warm-dark">
              Creators
            </span>
            <h2
              className="display mt-5 text-[36px] sm:text-[48px] md:text-[58px]"
              style={{ lineHeight: 1.05, fontWeight: 900 }}
            >
              Already accepting cha.
            </h2>
            <p className="mt-5 text-lg leading-[1.55] text-warm-dark md:text-xl">
              Real pages from real creators. Send a cha in taka, or buy
              something they made.
            </p>
          </div>

          <Link
            href="/creators"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[rgba(14,15,12,0.14)] bg-white px-5 text-[14px] font-semibold text-near-black transition-colors hover:border-near-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green"
          >
            See all creators →
          </Link>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <CreatorCard key={creator.handle} creator={creator} />
          ))}
        </div>
      </div>
    </section>
  );
}
