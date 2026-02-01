import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Explicit headers for static resources: avoid reflecting arbitrary Origins.
  // For robots.txt and sitemap.xml we don't need broad CORS, so set a
  // restrictive Access-Control-Allow-Origin to the canonical site origin.
  async headers() {
    return [
      {
        source: '/(robots\.txt|sitemap\.xml)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://neowhisper.net' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
