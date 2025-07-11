import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  images: {
    domains: ['vibe31.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;