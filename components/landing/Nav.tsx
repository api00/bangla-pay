import Link from "next/link";

import Button from "@/components/ui/Button";
import { getAuthedSession } from "@/lib/auth";

export default async function Nav() {
  const session = await getAuthedSession();

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 flex items-center justify-between h-16 md:h-20">
        <Link
          href="/"
          className="flex items-center gap-1.5"
          aria-label="BanglaPay home"
        >
          <span className="display text-2xl tracking-tight">banglapay</span>
          <span className="w-1.5 h-1.5 rounded-full bg-wise-green" aria-hidden />
        </Link>

        <div className="flex items-center gap-6 md:gap-8">
          <nav
            className="hidden md:flex items-center gap-7"
            aria-label="Main"
          >
            <Link
              href="/#how"
              className="text-[15px] font-semibold hover:opacity-60 transition-opacity"
            >
              How it works
            </Link>
            <Link
              href="/#shop"
              className="text-[15px] font-semibold hover:opacity-60 transition-opacity"
            >
              Shop
            </Link>
            <Link
              href="/creators"
              className="text-[15px] font-semibold hover:opacity-60 transition-opacity"
            >
              Creators
            </Link>
            <Link
              href="/#faq"
              className="text-[15px] font-semibold hover:opacity-60 transition-opacity"
            >
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Button
                  variant="ghost"
                  size="md"
                  href={`/${session.creator.handle}`}
                >
                  My page
                </Button>
                <Button variant="primary" size="md" href="/dashboard">
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="md" href="/login">
                  Log in
                </Button>
                <Button variant="primary" size="md" href="/login">
                  Start my page
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
