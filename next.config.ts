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
        source: "/(.*)",  // Apply to all pages
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none", // This allows the Coinbase Wallet SDK to function correctly
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none", // Ensure no cross-origin embedding issues
          },
        ],
      },
    ];
  },
};

export default nextConfig;
