import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses (Next does this in prod by default; explicit = obvious).
  compress: true,
  // Drop `console.log` from client bundles in prod.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  // Allow Supabase Storage as an Image source if we ever switch to next/image.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // The Drizzle/postgres client should run on Node, not Edge — but we keep
  // the door open here in case route handlers want it.
  experimental: {
    // Trim unused JS by deduplicating per-route imports.
    optimizePackageImports: ["drizzle-orm", "@supabase/ssr"],
  },
};

export default nextConfig;
