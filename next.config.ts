import type { NextConfig } from "next";

// Files in /public keep their names when replaced, so they get a month of caching
// plus a week of stale-while-revalidate rather than `immutable`. Rename a file to bust it.
const PUBLIC_ASSET_CACHE = "public, max-age=2592000, stale-while-revalidate=604800";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // The on-disk dev cache served stale CSS after restarts in this project and grew to gigabytes;
    // dev compiles from scratch instead (production builds keep their cache).
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // AVIF is about 20% smaller than WebP; browsers without it get WebP.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  async headers() {
    return [
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: PUBLIC_ASSET_CACHE }] },
      { source: "/video/:path*", headers: [{ key: "Cache-Control", value: PUBLIC_ASSET_CACHE }] },
    ];
  },
};

export default nextConfig;
