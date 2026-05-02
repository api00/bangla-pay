import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali, Baloo_Da_2 } from "next/font/google";
import "./globals.css";

// Trimmed to the four weights actually referenced by the design system.
// Inter 600 = body / Inter 900 = display headlines.
// Noto 600 = Bangla body. Baloo 800 = Bangla display headlines.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["600", "900"],
  display: "swap",
});

const notoBangla = Noto_Sans_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali"],
  weight: ["600"],
  display: "swap",
});

const balooBangla = Baloo_Da_2({
  variable: "--font-bangla-display",
  subsets: ["bengali", "latin"],
  weight: ["800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BanglaPay — Do what you love. Let fans back it.",
  description:
    "The easiest way to accept support from the people who love your work. Built for Bangladeshi creators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoBangla.variable} ${balooBangla.variable} h-full antialiased`}
    >
      <head>
        {/* Pre-warm the Supabase + Storage origins so the first DB / image
            request doesn't pay a fresh TCP+TLS handshake. */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link
              rel="preconnect"
              href={process.env.NEXT_PUBLIC_SUPABASE_URL}
              crossOrigin="anonymous"
            />
            <link
              rel="dns-prefetch"
              href={process.env.NEXT_PUBLIC_SUPABASE_URL}
            />
          </>
        )}
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
