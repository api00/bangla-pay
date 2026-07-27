type Point = {
  icon: React.ReactNode;
  body: React.ReactNode;
};

const strokeProps = {
  stroke: "#0e0f0c",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none" as const,
};

const points: Point[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" {...strokeProps} aria-hidden>
        <path d="M12 20.5s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10.5c0 5.65-7 10-7 10z" />
      </svg>
    ),
    body: (
      <>
        <strong className="text-near-black font-semibold">Supporters, not users.</strong> No customers, no conversion funnels &mdash; just the fans who love your work, and the cha they want to send you.
      </>
    ),
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" {...strokeProps} aria-hidden>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    ),
    body: (
      <>
        <strong className="text-near-black font-semibold">Your list, your rules.</strong> We&rsquo;ll never email your supporters. Export the whole list &mdash; names, messages, everything &mdash; whenever you like.
      </>
    ),
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" {...strokeProps} aria-hidden>
        <path d="M21 12a8 8 0 0 1-11.6 7.15L4 20l1-4.4A8 8 0 1 1 21 12z" />
      </svg>
    ),
    body: (
      <>
        <strong className="text-near-black font-semibold">Real humans, real replies.</strong> Write to us and someone who actually uses the product writes back. No bots, no ticket queues.
      </>
    ),
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" {...strokeProps} aria-hidden>
        <path d="M13 3 4 14h7l-1 7 9-11h-7z" />
      </svg>
    ),
    body: (
      <>
        <strong className="text-near-black font-semibold">Paid in hours, not weeks.</strong> Cash out to bKash, Nagad, Rocket, or any Bangladeshi bank. No 30-day holds, no surprise fees.
      </>
    ),
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-24 md:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-5 lg:px-10">
        <h2
          className="display text-center text-near-black text-[36px] sm:text-[44px] md:text-[54px] lg:text-[60px]"
          style={{ lineHeight: 1.1, fontWeight: 700 }}
        >
          Creators first. Everything else follows.
        </h2>

        <div className="mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 gap-x-12 md:gap-x-20 gap-y-10 md:gap-y-14 max-w-[880px] mx-auto">
          {points.map((p, i) => (
            <div key={i} className="flex items-start gap-4">
              <span
                className="shrink-0 w-10 h-10 rounded-full border-[1.5px] border-near-black flex items-center justify-center mt-1 bg-white"
                aria-hidden
              >
                {p.icon}
              </span>
              <p className="text-[18px] md:text-[20px] leading-[1.55] text-warm-dark">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
