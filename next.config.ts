import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow any HTTPS source — resellers paste images from Shopify CDNs,
    // AliExpress, custom stores, R2, etc. A domain whitelist would need
    // constant updates. unoptimized only affects Next.js image caching;
    // the <Image> component still handles lazy-loading and layout.
    unoptimized: true,
  },
};

export default nextConfig;
