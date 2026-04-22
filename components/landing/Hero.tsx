import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex items-center justify-center bg-white"
    >
      <div className="max-w-4xl mx-auto px-5 lg:px-10 text-center">
        <div className="inline-flex items-center gap-3 mb-8 md:mb-10 text-base md:text-[17px] font-semibold text-[#454745]">
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
            Loved by <span className="text-[#0e0f0c] tabular-nums">500+</span> Bangladeshi creators
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

        <p className="mt-5 md:mt-6 text-xl md:text-2xl text-[#454745] max-w-3xl mx-auto leading-[1.4]">
          Accept support from the people who love your work.
        </p>

        <div className="mt-12 md:mt-14 flex justify-center">
          <Button variant="primary" size="xl" href="#" noHover className="shadow-[0_1px_0_0_rgba(22,51,0,0.15),0_10px_30px_-10px_rgba(159,232,112,0.7)]">
            <span>Start my page</span>
            <span
              aria-hidden
              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#163300] text-[#9fe870] text-sm -mr-2"
            >
              →
            </span>
          </Button>
        </div>

        <div className="mt-6 text-[15px] md:text-base text-[#868685]">
          It&rsquo;s free and takes less than a minute
        </div>
      </div>
    </section>
  );
}
