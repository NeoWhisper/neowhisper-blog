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
    const isDev = process.env.NODE_ENV === "development";
    const isVercelPreview = process.env.VERCEL_ENV === "preview";
    const allowVercelTools = isDev || isVercelPreview;

    // Use wildcards to keep the header size reasonably small and prevent 400 errors
    const googleWildcards = [
      "https://*.googletagmanager.com",
      "https://*.google-analytics.com",
      "https://*.googlesyndication.com",
      "https://*.doubleclick.net",
      "https://*.googleadservices.com",
      "https://*.adtrafficquality.google",
      "https://*.google.com",
      "https://*.fundingchoicesmessages.google.com",
    ];

    const vercelDomains = allowVercelTools
      ? "https://vercel.live https://*.vercel.app"
      : "";

    const cspEntries = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}${googleWildcards.join(" ")} https://challenges.cloudflare.com ${vercelDomains}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: https://r2cdn.perplexity.ai",
      "font-src 'self' data: https: https://r2cdn.perplexity.ai",
      `connect-src 'self' ${isDev ? "ws://127.0.0.1:* ws://localhost:* " : ""}${googleWildcards.join(" ")} https://*.supabase.co ${vercelDomains}`,
      `frame-src 'self' https://challenges.cloudflare.com ${googleWildcards.join(" ")} ${vercelDomains}`,

      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ];

    const csp = cspEntries
      .map((entry) => entry.trim().replace(/\s+/g, " "))
      .filter((entry) => entry.trim() !== "") // Keep non-empty directives
      .join("; ");

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
