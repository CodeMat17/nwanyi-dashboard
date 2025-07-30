import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "compassionate-yak-922.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
