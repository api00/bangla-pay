import Link from "next/link";

import CreatorCard from "@/components/creators/CreatorCard";
import Footer from "@/components/landing/Footer";
import Nav from "@/components/landing/Nav";
import { listDirectoryCreators } from "@/db/queries/creators";
import { creatorCategory } from "@/db/schema";
import { SITE_NAME } from "@/lib/site";

// Creator removals and profile changes must appear immediately.
export const dynamic = "force-dynamic";

export const metadata = {
  title: `Discover creators · ${SITE_NAME}`,
  description:
    "Browse Bangladeshi writers, musicians, illustrators, educators and developers you can support in taka.",
};

const FILTERS = [
  { value: "", label: "All" },
  { value: "writer", label: "Writers" },
  { value: "illustrator", label: "Illustrators" },
  { value: "musician", label: "Musicians" },
  { value: "educator", label: "Educators" },
  { value: "developer", label: "Developers" },
  { value: "podcaster", label: "Podcasters" },
  { value: "video_creator", label: "Video" },
  { value: "photographer", label: "Photo" },
] as const;

type CreatorCategory = (typeof creatorCategory.enumValues)[number];

function parseCategory(value: string | undefined): CreatorCategory | undefined {
  return creatorCategory.enumValues.includes(value as CreatorCategory)
    ? (value as CreatorCategory)
    : undefined;
}

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function CreatorsDirectoryPage({
  searchParams,
}: PageProps) {
  const { category: raw } = await searchParams;
  const category = parseCategory(raw);
  const creators = await listDirectoryCreators(60, category);

  return (
    <>
      <Nav />
      <main className="bg-white">
        <section className="mx-auto max-w-[1120px] px-5 pb-16 pt-12 sm:px-6 md:pt-16">
          <header className="max-w-[640px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gray">
              Discover
            </p>
            <h1
              className="display mt-3 text-[38px] text-near-black sm:text-[54px]"
              style={{ lineHeight: 0.95, fontWeight: 900 }}
            >
              Creators worth backing.
            </h1>
            <p className="mt-4 text-[16px] leading-[1.6] text-warm-dark">
              Bangladeshi writers, musicians, illustrators and educators. Send a
              cha in taka, or buy something they made.
            </p>
          </header>

          <nav
            aria-label="Filter by category"
            className="mt-8 flex flex-wrap gap-2"
          >
            {FILTERS.map((filter) => {
              const active = (raw ?? "") === filter.value;
              return (
                <Link
                  key={filter.value || "all"}
                  href={
                    filter.value ? `/creators?category=${filter.value}` : "/creators"
                  }
                  aria-current={active ? "page" : undefined}
                  className={[
                    "inline-flex min-h-10 items-center rounded-full px-4 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green",
                    active
                      ? "bg-dark-green text-white"
                      : "border border-[rgba(14,15,12,0.12)] bg-white text-warm-dark hover:border-near-black hover:text-near-black",
                  ].join(" ")}
                >
                  {filter.label}
                </Link>
              );
            })}
          </nav>

          {creators.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-[rgba(14,15,12,0.14)] bg-off-white px-8 py-14 text-center">
              <p className="text-[17px] font-semibold text-near-black">
                No creators here yet.
              </p>
              <p className="mx-auto mt-2 max-w-[420px] text-[14px] leading-[1.6] text-warm-dark">
                {category
                  ? "Nobody in this category has published a page yet. Try another one."
                  : "Be the first — claim your handle and start collecting cha."}
              </p>
              <Link
                href={category ? "/creators" : "/signup"}
                className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-wise-green px-6 text-[14px] font-semibold text-dark-green transition-transform hover:scale-[1.02] active:scale-[0.98] motion-reduce:transform-none"
              >
                {category ? "See all creators" : "Create your page"}
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {creators.map((creator) => (
                <CreatorCard key={creator.handle} creator={creator} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
