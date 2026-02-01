import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  poweredByHeader: false,
  images: {
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Security headers: prevent MIME type sniffing in browsers.
  // Add `X-Content-Type-Options: nosniff` globally to ensure the browser
  // only treats responses as the declared MIME type.
  async headers() {
    const csp =
      "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Powered-By", value: "" },
        ],
      },
      // Remove CORS header from robots.txt and sitemap.xml for security
      {
        source: "/robots.txt",
        headers: [{ key: "Access-Control-Allow-Origin", value: "" }],
      },
      {
        source: "/sitemap.xml",
        headers: [{ key: "Access-Control-Allow-Origin", value: "" }],
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
