/**
 * NeoWhisper - Modern Tech Blog
 * Copyright (c) 2026 Yousif Alqadi
 * Licensed under the MIT License
 */

import type { Metadata } from "next";
import "./globals.css";
import "highlight.js/styles/github-dark.css"; // Syntax highlighting theme
import { Suspense } from "react";
import { headers } from "next/headers";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieBanner from "@/components/CookieBanner";
import AuthCodeRedirect from "@/components/AuthCodeRedirect";

import { outfit, geistMono } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.neowhisper.net",
  ),
  title: "NeoWhisper - Tech Blog",
  description:
    "Full-stack development with trilingual support (日本語・English・العربية).",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" className={`${outfit.variable} ${geistMono.variable}`}>
      <head>
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <script
            nonce={nonce}
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
        <GoogleAnalytics nonce={nonce} />
        <Suspense fallback={null}>
          <AuthCodeRedirect />
        </Suspense>
        {children}
        {/* Cookie consent banner */}
        <Suspense fallback={null}>
          <CookieBanner />
        </Suspense>
      </body>
    </html>
  );
}
