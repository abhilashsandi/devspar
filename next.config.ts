import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // The study guides and their shared engine are static files regenerated on every build
        // (scripts/study/emit-static.mjs). Cache them for a while, but always revalidate so an
        // edit goes live on the next deploy instead of waiting out a long browser cache.
        source: "/study/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=600, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
