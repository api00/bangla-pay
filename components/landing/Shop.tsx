export default function Shop() {
  return (
    <section id="shop" className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <div className="rounded-[36px] bg-off-white border border-[rgba(14,15,12,0.08)] px-6 md:px-12 lg:px-16 py-16 md:py-24 text-center">
        <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-warm-dark">
          Shop
        </span>

        <h2
          className="display mt-5 text-[36px] sm:text-[48px] md:text-[58px] lg:text-[64px]"
          style={{ lineHeight: 1.1, fontWeight: 700 }}
        >
          Meet Shop.
          <br />
          The creator&rsquo;s way to sell.
        </h2>

        <p className="mt-6 text-lg md:text-xl text-warm-dark leading-[1.5] max-w-2xl mx-auto">
          Sell original e-books, audio, and design packs straight from your
          page &mdash; priced in taka and delivered securely after purchase.
          Think Kindle or Spotify, but direct from creator to supporter.
        </p>

        {/* Visual — product card with supporting floating cards */}
        <div className="mt-16 md:mt-20 relative w-[280px] sm:w-[300px] mx-auto">
          {/* Central product card */}
          <div className="relative z-10 rounded-[28px] bg-white border border-[rgba(14,15,12,0.08)] shadow-[0_30px_60px_-24px_rgba(14,15,12,0.18)] overflow-hidden">
            {/* Cover */}
            <div className="relative aspect-[1.15/1] bg-gradient-to-br from-wise-green to-pastel-green flex items-center justify-center">
              <span className="absolute top-3.5 left-3.5 bg-white rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider text-near-black border border-[rgba(14,15,12,0.08)]">
                .PDF
              </span>

              {/* Illustrated book — tilted, with cream pages, dark cover, Bangla title */}
              <div className="relative" aria-hidden>
                {/* Sparkles */}
                <svg
                  className="absolute -top-5 -left-7 w-4 h-4 text-dark-green"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c.5 6 1.5 7 10 10.5-8.5 3.5-9.5 4.5-10 10.5-.5-6-1.5-7-10-10.5 8.5-3.5 9.5-4.5 10-10.5z" />
                </svg>
                <svg
                  className="absolute -top-2 right-[-18px] w-3 h-3 text-dark-green"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c.5 6 1.5 7 10 10.5-8.5 3.5-9.5 4.5-10 10.5-.5-6-1.5-7-10-10.5 8.5-3.5 9.5-4.5 10-10.5z" />
                </svg>
                <svg
                  className="absolute bottom-0 -right-6 w-4 h-4 text-dark-green"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c.5 6 1.5 7 10 10.5-8.5 3.5-9.5 4.5-10 10.5-.5-6-1.5-7-10-10.5 8.5-3.5 9.5-4.5 10-10.5z" />
                </svg>

                {/* Book */}
                <div className="relative w-[110px] h-[130px] -rotate-[4deg]">
                  {/* Pages peeking out right */}
                  <div className="absolute inset-y-1 right-[-5px] w-[5px] rounded-r-[2px] bg-[#fff9e8] shadow-[inset_-1px_0_0_rgba(14,15,12,0.08)]" />
                  {/* Cover */}
                  <div className="absolute inset-0 rounded-[6px] bg-dark-green shadow-[4px_5px_0_rgba(14,15,12,0.18)] flex flex-col items-center justify-center px-3">
                    <span className="bangla-display text-[48px] text-wise-green leading-none">
                      বই
                    </span>
                    <span className="mt-2 text-[8px] font-semibold tracking-[0.2em] uppercase text-wise-green/80">
                      Vol · 2
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Details */}
            <div className="p-5">
              <div className="text-left">
                <h3 className="text-[17px] font-bold tracking-tight text-near-black">
                  Monsoon Stories, Vol. 2
                </h3>
                <div className="flex items-center gap-2 mt-1 text-[12px] text-gray">
                  <span className="font-semibold text-near-black tabular-nums">
                    ৳250
                  </span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="#ffd11a"
                      aria-hidden
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="tabular-nums">4.9 (36)</span>
                  </span>
                </div>
              </div>
              {/* Description skeleton */}
              <div className="mt-4 space-y-1.5" aria-hidden>
                <div className="h-1.5 rounded-full bg-light-surface w-full" />
                <div className="h-1.5 rounded-full bg-light-surface w-3/4" />
              </div>
              <button
                type="button"
                className="mt-5 w-full h-12 rounded-full bg-wise-green text-dark-green font-semibold text-[15px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Buy
              </button>
            </div>
          </div>

          {/* Floating — top left: One-tap bKash pill */}
          <div className="hidden md:flex absolute -top-5 -left-28 lg:-left-36 z-20 items-center gap-2 rounded-full bg-white border border-[rgba(14,15,12,0.08)] shadow-[0_10px_30px_-12px_rgba(14,15,12,0.15)] px-3.5 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/bkash.svg" alt="bKash" className="h-4 w-auto" />
            <span className="text-[12px] font-semibold text-near-black whitespace-nowrap">
              One-tap checkout
            </span>
          </div>

          {/* Floating — bottom left: Sales card */}
          <div className="hidden md:block absolute bottom-16 -left-24 lg:-left-32 z-20 rounded-2xl bg-white border border-[rgba(14,15,12,0.08)] shadow-[0_10px_30px_-12px_rgba(14,15,12,0.15)] p-3.5 w-[112px] text-left">
            <div className="w-7 h-7 rounded-lg bg-light-mint flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#163300"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 7h14l-1 13H6z" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" />
              </svg>
            </div>
            <div className="text-[22px] font-bold tabular-nums mt-2 text-near-black leading-none">
              753
            </div>
            <div className="text-[11px] text-gray mt-1">Sales</div>
          </div>

          {/* Floating — top right: Rating card */}
          <div className="hidden md:block absolute top-10 -right-28 lg:-right-36 z-20 rounded-2xl bg-white border border-[rgba(14,15,12,0.08)] shadow-[0_10px_30px_-12px_rgba(14,15,12,0.15)] p-3 w-[168px] text-left">
            <div className="text-[11px] text-gray mb-1.5">
              Liked it? give rating
            </div>
            <div className="flex items-center gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <svg
                  key={i}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="#ffd11a"
                  aria-hidden
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c8c8c7"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="mt-2 inline-block bg-[#fff4d6] rounded px-1.5 py-0.5 text-[10px] font-semibold text-[#8a6d00]">
              4 star
            </div>
          </div>

          {/* Floating — bottom right: Earnings pill */}
          <div className="hidden md:flex absolute bottom-24 -right-24 lg:-right-32 z-20 items-center gap-2 rounded-full bg-white border border-[rgba(14,15,12,0.08)] shadow-[0_10px_30px_-12px_rgba(14,15,12,0.15)] px-3.5 py-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-dark-green text-wise-green text-[11px] font-bold">
              ৳
            </span>
            <span className="text-[13px] font-bold tabular-nums text-near-black whitespace-nowrap">
              24,400
            </span>
            <span className="text-[11px] text-gray whitespace-nowrap">
              Earnings
            </span>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
