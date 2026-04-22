import Button from "@/components/ui/Button";

export default function Mission() {
  return (
    <section id="why" className="py-20 md:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        {/* Wrapper for paper-card backing effect */}
        <div className="relative">
          {/* Dotted paper backing — visible on the right + bottom edges */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-[36px] translate-x-2 translate-y-2 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(14,15,12,0.22) 1px, transparent 1.5px)",
              backgroundSize: "6px 6px",
              backgroundPosition: "0 0",
            }}
          />

          {/* Framed card (sits in front of the dotted backing) */}
          <div className="relative rounded-[36px] bg-[#f7f9f5] border-[1.5px] border-[#0e0f0c] p-8 md:p-12 lg:p-14">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#454745]">
              Why BanglaPay
            </span>

            <h2
              className="display mt-5 text-[44px] sm:text-[56px] md:text-[64px] lg:text-[72px]"
              style={{ lineHeight: 1.1, fontWeight: 700 }}
            >
              A cha jar of our own.
            </h2>

            <div className="mt-8 space-y-5 text-[23px] leading-[1.5] text-[#454745] max-w-[780px]">
              <p>
                For too long, creators here have had to use platforms built for someone else&rsquo;s market. Someone else&rsquo;s currency. Someone else&rsquo;s wallet.
              </p>
              <p>
                BanglaPay is the tip jar, rebuilt for Bangladesh. Your fans pay with the wallets they already have &mdash; bKash, Nagad, Rocket, or card. You keep almost every paisa.
              </p>
              <p className="text-[#0e0f0c] font-semibold">
                Just you, your supporters, and the cha they want to buy you.
              </p>
            </div>

            <div className="mt-8">
              <Button variant="dark" size="md" href="#">
                Read our full story
                <span aria-hidden>→</span>
              </Button>

              {/* Hand-drawn annotation below CTA — centered, arrow arcs upward */}
              <div className="mt-6 flex items-center justify-center gap-4 text-[20px] md:text-[22px] font-semibold text-[#454745]">
                <span className="text-6xl md:text-7xl leading-none" aria-hidden>
                  ☕
                </span>
                <svg
                  width="110"
                  height="72"
                  viewBox="0 0 110 72"
                  className="shrink-0 -translate-y-4 md:-translate-y-6"
                  aria-hidden
                >
                  <path
                    d="M 6 60 Q 55 0 92 50 M 92 50 L 80 44 M 92 50 L 80 56"
                    stroke="#0e0f0c"
                    strokeWidth="2.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Made for Bangladesh</span>
                <span className="text-6xl md:text-7xl leading-none" aria-hidden>
                  🇧🇩
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
