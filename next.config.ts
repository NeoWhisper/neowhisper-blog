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
    // NOTE: Next.js App Router uses inline scripts for hydration / RSC runtime.
    // A strict nonce-based CSP is possible, but requires deeper integration.
    // For now we allow inline scripts while still restricting sources.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://googleads.g.doubleclick.net https://adtrafficquality.google https://*.adtrafficquality.google https://fundingchoicesmessages.google.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://adtrafficquality.google https://*.adtrafficquality.google https://fundingchoicesmessages.google.com https://challenges.cloudflare.com https://*.google.com",
      "frame-src 'self' https://challenges.cloudflare.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.google.com https://adtrafficquality.google https://*.adtrafficquality.google https://fundingchoicesmessages.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; ");

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
