import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    serverActions: {
      // Leave room for multipart encoding while staying below Vercel's limit.
      bodySizeLimit: "4300kb",
    },
  },
  outputFileTracingExcludes: {
    "/*": [".data/**/*"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
