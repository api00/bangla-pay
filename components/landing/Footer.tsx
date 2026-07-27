import Link from "next/link";

const navLinks = [
  { label: "About", href: "#" },
  { label: "Help", href: "#" },
  { label: "FAQ", href: "/#faq" },
  { label: "Copyright", href: "/copyright" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

export default function Footer() {
  return (
    <footer className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left — copyright */}
        <div className="text-[15px] text-warm-dark">
          © BanglaPay
        </div>

        {/* Center — nav links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-1 text-[15px] font-semibold text-near-black md:gap-x-9">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="inline-flex min-h-11 items-center transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right — social icons */}
        <div className="flex items-center gap-5">
          <a
            href="#"
            aria-label="X (Twitter)"
            className="text-near-black hover:opacity-60 transition-opacity"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="#"
            aria-label="YouTube"
            className="text-near-black hover:opacity-60 transition-opacity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
          <a
            href="#"
            aria-label="Instagram"
            className="text-near-black hover:opacity-60 transition-opacity"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
