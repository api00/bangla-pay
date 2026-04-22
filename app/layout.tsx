import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali, Baloo_Da_2 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

const notoBangla = Noto_Sans_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali"],
  weight: ["400", "600", "900"],
  display: "swap",
});

const balooBangla = Baloo_Da_2({
  variable: "--font-bangla-display",
  subsets: ["bengali", "latin"],
  weight: ["500", "700", "800"],
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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
