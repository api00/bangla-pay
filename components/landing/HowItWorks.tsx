export default function HowItWorks() {
  return (
    <section id="how" className="py-12 md:py-16 bg-white">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        {/* Framed block — header + demo */}
        <div className="rounded-[36px] bg-off-white border border-[rgba(14,15,12,0.06)] px-6 md:px-12 py-14 md:py-20">
          {/* Header */}
          <div className="text-center">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-warm-dark">
              Support
            </span>
            <h2
              className="display mt-5 text-[36px] sm:text-[48px] md:text-[58px] lg:text-[66px]"
              style={{ lineHeight: 1.1, fontWeight: 700 }}
            >
              An easy way for fans
              <br />
              to say thanks.
            </h2>
            <p className="mt-6 text-xl md:text-2xl text-warm-dark leading-[1.5] max-w-2xl mx-auto">
              Supporters pick an amount, leave a note, and pay with the wallet they already use. No account needed.
            </p>
          </div>

          {/* Demo */}
          <div className="mt-16 md:mt-20 relative max-w-[420px] mx-auto">
            {/* Central tip card */}
            <div className="relative z-10 rounded-[28px] bg-white border border-[rgba(14,15,12,0.08)] shadow-[0_20px_50px_-20px_rgba(14,15,12,0.10)] p-6 md:p-7">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-wise-green to-pastel-green flex items-center justify-center shrink-0">
                    <span className="bangla-display text-base text-dark-green">তা</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray">
                      Buy a cha for
                    </div>
                    <div
                      className="text-[19px] mt-0.5 tracking-tight"
                      style={{ lineHeight: 1, fontWeight: 700 }}
                    >
                      Tahsina
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-warm-dark">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-wise-green animate-pulse"
                    aria-hidden
                  />
                  live
                </div>
              </div>

              {/* Divider */}
              <div className="mt-5 border-t border-[rgba(14,15,12,0.06)]" />

              {/* Amount selector */}
              <div className="mt-5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray mb-3">
                  Choose amount
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: "৳50", on: false },
                    { v: "৳100", on: true },
                    { v: "৳500", on: false },
                  ].map((chip) => (
                    <div
                      key={chip.v}
                      className={`relative text-center py-3 text-[14px] font-semibold rounded-xl tabular-nums ${
                        chip.on
                          ? "bg-wise-green text-dark-green ring-2 ring-dark-green ring-offset-2 ring-offset-white"
                          : "bg-[rgba(22,51,0,0.04)] text-near-black border border-[rgba(14,15,12,0.06)]"
                      }`}
                    >
                      {chip.v}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-3 w-full text-[12px] font-semibold text-warm-dark underline underline-offset-4 decoration-wise-green decoration-2"
                >
                  or enter a custom amount
                </button>
              </div>

              {/* Message field */}
              <div className="mt-5 p-3.5 rounded-xl bg-off-white border border-[rgba(14,15,12,0.04)]">
                <p className="text-[13px] text-gray">
                  Say something nice&hellip;
                </p>
              </div>

              {/* CTA */}
              <button
                type="button"
                className="mt-4 w-full h-12 rounded-full bg-wise-green text-dark-green font-semibold text-[15px] tabular-nums"
              >
                Send ৳100
              </button>
            </div>

            {/* Floating card — top left */}
            <div className="hidden md:flex absolute -top-3 -left-40 lg:-left-52 z-0 items-start gap-3 rounded-2xl bg-white border border-[rgba(14,15,12,0.06)] shadow-[0_8px_24px_-8px_rgba(14,15,12,0.10)] p-3 pr-4 w-[220px]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pastel-green to-light-mint shrink-0 flex items-center justify-center">
                <span className="bangla-display text-[13px] text-dark-green">রা</span>
              </div>
              <div className="min-w-0 pt-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13px] font-semibold truncate">Raisa</span>
                  <span className="text-[10px] font-semibold text-gray tabular-nums shrink-0">2m</span>
                </div>
                <div className="text-[11px] text-warm-dark mt-0.5 truncate">
                  &ldquo;Keep making comics!&rdquo;
                </div>
              </div>
            </div>

            {/* Floating card — bottom right */}
            <div className="hidden md:flex absolute -bottom-5 -right-40 lg:-right-52 z-0 items-start gap-3 rounded-2xl bg-white border border-[rgba(14,15,12,0.06)] shadow-[0_8px_24px_-8px_rgba(14,15,12,0.10)] p-3 pr-4 w-[220px]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-wise-green to-pastel-green shrink-0 flex items-center justify-center text-[13px] font-bold text-dark-green">
                N
              </div>
              <div className="min-w-0 pt-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13px] font-semibold truncate">Nahiyan</span>
                  <span className="text-[10px] font-semibold text-gray tabular-nums shrink-0">8m</span>
                </div>
                <div className="bangla text-[11px] text-warm-dark mt-0.5 truncate">
                  &ldquo;তোমার ভিডিও অসাধারণ&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
