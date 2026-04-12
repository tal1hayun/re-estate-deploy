import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      // HTML pages and API routes — never cache.
      // Forces the browser to always fetch fresh content from the server.
      // Next.js automatically handles immutable caching for /_next/static/ (content-hashed).
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;
