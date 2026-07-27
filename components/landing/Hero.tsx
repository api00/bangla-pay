import Button from "@/components/ui/Button";
import { getAuthedSession } from "@/lib/auth";

export default async function Hero() {
  const session = await getAuthedSession();
  const ctaHref = session ? "/dashboard" : "/login";
  const ctaLabel = session ? "Go to dashboard" : "Start my page";
  const ctaSubcopy = session
    ? `Welcome back, ${session.creator.displayName.split(/\s+/)[0]}.`
    : "It’s free and takes less than a minute";

  return (
    <section
      id="top"
      className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex items-center justify-center bg-white"
    >
      <div className="max-w-4xl mx-auto px-5 lg:px-10 text-center">
        <div className="inline-flex items-center gap-3 mb-8 md:mb-10 text-base md:text-[17px] font-semibold text-warm-dark">
          <svg
            viewBox="0 0 24 14"
            width="34"
            height="20"
            aria-label="Bangladesh flag"
            className="rounded-[4px] shadow-[0_0_0_1px_rgba(14,15,12,0.10)]"
          >
            <rect width="24" height="14" fill="#054d28" />
            <circle cx="10" cy="7" r="4.2" fill="#da291c" />
          </svg>
          <span>
            Loved by <span className="text-near-black tabular-nums">500+</span> Bangladeshi creators
          </span>
        </div>

        <h1
          className="display text-[44px] sm:text-[56px] md:text-[64px] lg:text-[72px]"
          style={{ lineHeight: 1.25 }}
        >
          Do what you love.
          <br />
          Let fans back it.
        </h1>

        <p className="mt-5 md:mt-6 text-xl md:text-2xl text-warm-dark max-w-3xl mx-auto leading-[1.4]">
          Accept support from the people who love your work.
        </p>

        <div className="mt-12 md:mt-14 flex justify-center">
          <Button
            variant="primary"
            size="xl"
            href={ctaHref}
            noHover
            className="shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-10px_rgba(159,232,112,0.7)]"
          >
            <span>{ctaLabel}</span>
            <span
              aria-hidden
              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-dark-green text-wise-green text-sm -mr-2"
            >
              →
            </span>
          </Button>
        </div>

        <div className="mt-6 text-[15px] md:text-base text-gray">
          {ctaSubcopy}
        </div>

        {/* Payment rails — trust row */}
        <div className="mt-14 md:mt-16 flex flex-col items-center gap-5">
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-gray">
            Works with
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 md:gap-x-10">
            {/* eslint-disable @next/next/no-img-element */}
            <img src="/logos/bkash.svg" alt="bKash" className="h-8 md:h-10 w-auto" />
            <span className="w-1 h-1 rounded-full bg-gray-light" aria-hidden />
            <img src="/logos/nagad.svg" alt="Nagad" className="h-7 md:h-9 w-auto" />
            <span className="w-1 h-1 rounded-full bg-gray-light" aria-hidden />
            <img src="/logos/rocket.svg" alt="Rocket" className="h-11 md:h-12 w-auto" />
            <span className="w-1 h-1 rounded-full bg-gray-light" aria-hidden />
            <img src="/logos/visa.svg" alt="Visa" className="h-6 md:h-7 w-auto" />
            <span className="w-1 h-1 rounded-full bg-gray-light" aria-hidden />
            <img src="/logos/mastercard.svg" alt="Mastercard" className="h-11 md:h-12 w-auto" />
            {/* eslint-enable @next/next/no-img-element */}
          </div>
        </div>
      </div>
    </section>
  );
}
