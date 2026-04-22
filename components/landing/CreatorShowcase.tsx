"use client";

import { useState } from "react";

type Creator = {
  category: string;
  initials: string;
  bangla?: boolean;
  name: string;
  role: string;
  bg: string;
  fg: "dark" | "light";
};

const categories = [
  "Illustrators",
  "YouTubers",
  "Writers",
  "Musicians",
  "Podcasters",
  "Teachers",
  "Photographers",
  "Designers",
  "Developers",
  "Comedians",
  "Streamers",
  "Filmmakers",
] as const;
type Category = (typeof categories)[number];

// gradient + fg presets — cycled through for variety
const LIGHT = "dark" as const;
const DARK = "light" as const;
const palettes = [
  { bg: "from-[#9fe870] to-[#cdffad]", fg: LIGHT },
  { bg: "from-[#cdffad] to-[#9fe870]", fg: LIGHT },
  { bg: "from-[#0e0f0c] to-[#163300]", fg: DARK },
  { bg: "from-[#e2f6d5] to-[#cdffad]", fg: LIGHT },
  { bg: "from-[#054d28] to-[#9fe870]", fg: DARK },
  { bg: "from-[#163300] to-[#054d28]", fg: DARK },
  { bg: "from-[#9fe870] to-[#e2f6d5]", fg: LIGHT },
  { bg: "from-[#cdffad] to-[#e2f6d5]", fg: LIGHT },
  { bg: "from-[#163300] to-[#9fe870]", fg: DARK },
  { bg: "from-[#0e0f0c] to-[#454745]", fg: DARK },
  { bg: "from-[#f7f9f5] to-[#e8ebe6]", fg: LIGHT },
  { bg: "from-[#e2f6d5] to-[#9fe870]", fg: LIGHT },
];

function make(
  category: Category,
  initials: string,
  name: string,
  role: string,
  idx: number,
  bangla = false,
): Creator {
  const p = palettes[idx % palettes.length];
  return { category, initials, bangla, name, role, bg: p.bg, fg: p.fg };
}

const creators: Creator[] = [
  // Illustrators
  make("Illustrators", "তা", "Tahsina Rahman", "Zine comics", 0, true),
  make("Illustrators", "লা", "Labiba Kabir", "Comic artist", 1, true),
  make("Illustrators", "F", "Faisal Rana", "Editorial illustrator", 2),

  // YouTubers
  make("YouTubers", "NR", "Nahiyan Rahman", "Tech reviews", 3),
  make("YouTubers", "প", "Priya Das", "Food & travel", 4, true),
  make("YouTubers", "R", "Rakib Islam", "Short films", 5),

  // Writers
  make("Writers", "সা", "Sadia Akter", "Essayist", 6, true),
  make("Writers", "NH", "Nusrat Hoque", "Short fiction", 7),
  make("Writers", "শ", "Shakil Ahmed", "Newsletter", 8, true),

  // Musicians
  make("Musicians", "RK", "Rafiq Khan", "Folk musician", 9),
  make("Musicians", "মে", "Mehjabin Haq", "Indie pop", 10, true),
  make("Musicians", "M", "Mehdi Anwar", "Classical sitar", 11),

  // Podcasters
  make("Podcasters", "T", "Tasnim Zahid", "Startup podcast", 0),
  make("Podcasters", "র", "Raza Karim", "Football talk", 1, true),
  make("Podcasters", "O", "Omar Siddiqi", "Poetry readings", 2),

  // Teachers
  make("Teachers", "A", "Anika Rahim", "Math tutor", 3),
  make("Teachers", "F", "Fahim Chowdhury", "English prep", 4),
  make("Teachers", "রু", "Rumana Begum", "Science explainer", 5, true),

  // Photographers
  make("Photographers", "IF", "Imran Faisal", "Street photography", 6),
  make("Photographers", "SH", "Shahin Ali", "Portraits", 7),
  make("Photographers", "জ", "Jamil Rahman", "Weddings", 8, true),

  // Designers
  make("Designers", "M", "Maya Islam", "Brand design", 9),
  make("Designers", "Z", "Zubair Khan", "UX design", 10),
  make("Designers", "ন", "Nabila Akter", "Typography", 11, true),

  // Developers
  make("Developers", "আ", "Arif Hasan", "Indie dev", 0, true),
  make("Developers", "N", "Nasif Ahmed", "Web tutorials", 1),
  make("Developers", "T", "Tanzila Rahman", "Open source", 2),

  // Comedians
  make("Comedians", "S", "Sumon Kabir", "Stand-up", 3),
  make("Comedians", "মি", "Mishu Rahman", "Sketch comedy", 4, true),
  make("Comedians", "R", "Ratul Chowdhury", "Satire", 5),

  // Streamers
  make("Streamers", "SF", "Shafin Noor", "Esports", 6),
  make("Streamers", "T", "Tushar Alam", "Music streams", 7),
  make("Streamers", "রু", "Ruhi Rashid", "Art streams", 8, true),

  // Filmmakers
  make("Filmmakers", "TN", "Tanvir Noor", "Short films", 9),
  make("Filmmakers", "S", "Saif Hasan", "Documentaries", 10),
  make("Filmmakers", "সা", "Samia Khan", "Experimental", 11, true),
];

export default function CreatorShowcase() {
  const [active, setActive] = useState<Category>("Illustrators");
  const filtered = creators.filter((c) => c.category === active);

  return (
    <section id="creators" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#454745]">
            Creators
          </span>
          <h2
            className="display mt-5 text-[36px] sm:text-[48px] md:text-[58px] lg:text-[66px]"
            style={{ lineHeight: 1.1, fontWeight: 700 }}
          >
            From Dhaka to Chattogram.
            <br />
            From zines to podcasts.
          </h2>
          <p className="mt-6 text-xl md:text-2xl text-[#454745] leading-[1.5] max-w-2xl mx-auto">
            Pick a craft to see who&rsquo;s already accepting cha &mdash; and get a preview of what your own page could look like.
          </p>
        </div>

        {/* Category pills */}
        <div
          role="tablist"
          className="mt-12 md:mt-14 flex flex-wrap justify-center gap-2 md:gap-2.5"
        >
          {categories.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => setActive(cat)}
                className={`px-5 py-2.5 rounded-full text-[14px] md:text-[15px] font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#9fe870] text-[#163300] ring-2 ring-[#163300] ring-offset-2 ring-offset-white"
                    : "bg-white border border-[rgba(14,15,12,0.12)] text-[#0e0f0c] hover:border-[#9fe870]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Creator grid — filtered */}
        <div className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((c) => (
            <a key={c.name} href="#" className="group block">
              <div
                className={`relative aspect-[4/5] rounded-[22px] bg-gradient-to-br ${c.bg} overflow-hidden border border-[rgba(14,15,12,0.06)]`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`${
                      c.bangla ? "bangla-display" : "display"
                    } text-[96px] md:text-[120px] ${
                      c.fg === "light" ? "text-white/85" : "text-[#163300]"
                    }`}
                    style={{ lineHeight: 1, fontWeight: c.bangla ? 800 : 900 }}
                  >
                    {c.initials}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 text-[10px] font-semibold tracking-[0.14em] uppercase opacity-60">
                  <span
                    className={c.fg === "light" ? "text-white" : "text-[#163300]"}
                  >
                    banglapay
                  </span>
                </div>
              </div>

              <div className="mt-4 px-1">
                <div className="font-semibold text-[15px] text-[#0e0f0c] truncate">
                  {c.name}
                </div>
                <div className="text-[13px] text-[#868685] mt-0.5 truncate">
                  {c.role}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Footer link */}
        <div className="mt-14 md:mt-16 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#454745] hover:text-[#0e0f0c]"
          >
            Browse every creator on BanglaPay
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
