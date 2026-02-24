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
      `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""
      } https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://adtrafficquality.google https://*.adtrafficquality.google https://fundingchoicesmessages.google.com https://challenges.cloudflare.com https://partner.googleadservices.com https://*.google.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: https://r2cdn.perplexity.ai",
      "font-src 'self' data: https: https://r2cdn.perplexity.ai",
      `connect-src 'self' ${process.env.NODE_ENV === "development" ? "ws://127.0.0.1:* ws://localhost:*" : ""
      } https://www.google-analytics.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://adtrafficquality.google https://*.adtrafficquality.google https://fundingchoicesmessages.google.com https://challenges.cloudflare.com https://*.google.com https://*.supabase.co`,
      "frame-src 'self' https://challenges.cloudflare.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://*.google.com https://adtrafficquality.google https://*.adtrafficquality.google https://fundingchoicesmessages.google.com",
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
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
