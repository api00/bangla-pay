import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Supabase Storage as a remote image source.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
