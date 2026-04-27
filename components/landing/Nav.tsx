import Button from "@/components/ui/Button";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 flex items-center justify-between h-16 md:h-20">
        <a
          href="#top"
          className="flex items-center gap-1.5"
          aria-label="BanglaPay home"
        >
          <span className="display text-2xl tracking-tight">banglapay</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#9fe870]" aria-hidden />
        </a>

        <div className="flex items-center gap-6 md:gap-8">
          <nav
            className="hidden md:flex items-center gap-7"
            aria-label="Main"
          >
            <a
              href="/#how"
              className="text-[15px] font-semibold hover:opacity-60 transition-opacity"
            >
              How it works
            </a>
            <a
              href="/#shop"
              className="text-[15px] font-semibold hover:opacity-60 transition-opacity"
            >
              Shop
            </a>
            <a
              href="/#creators"
              className="text-[15px] font-semibold hover:opacity-60 transition-opacity"
            >
              Creators
            </a>
            <a
              href="/#faq"
              className="text-[15px] font-semibold hover:opacity-60 transition-opacity"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="md" href="/login">
              Log in
            </Button>
            <Button variant="primary" size="md" href="/login">
              Start my page
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
