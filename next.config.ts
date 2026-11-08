import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    // Offline detection: Server Actions wait and retry when the network returns,
    // and `useOffline()` drives the offline banner + autosave status (UI_ENGINEERING.md #6, #20)
    useOffline: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Book covers (Open Library redirects to archive.org; redirects are followed automatically)
    remotePatterns: [new URL("https://covers.openlibrary.org/b/**")],
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
