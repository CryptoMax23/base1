import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {},
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    "astagereborn.com",
    "*.astagereborn.com",
    "localhost:3000",
    "*.localhost:3000",
    "localhost:8788",
    "*.localhost:8788",
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none", 
          },
        ],
      },
    ];
  },
};

export default nextConfig;