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
import { SITE_URL } from "@/lib/site-config";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

const siteUrl = SITE_URL;
const siteName = "NeoWhisper";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NeoWhisper | Trilingual Tech Blog & IT Services",
    template: `%s | ${siteName}`,
  },
  applicationName: siteName,
  description:
    "Multilingual tech blog and IT services in Japanese, English, and Arabic: software, apps, web production, and practical engineering guides.",
  keywords: [
    "NeoWhisper",
    "tech blog",
    "software development",
    "app development",
    "web development",
    "Japan IT services",
    "multilingual blog",
    "Japanese English Arabic",
  ],
  authors: [{ name: "Yousif Alqadi", url: `${siteUrl}/about` }],
  creator: "Yousif Alqadi",
  publisher: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: "NeoWhisper | Trilingual Tech Blog & IT Services",
    description:
      "Multilingual tech blog and IT services in Japanese, English, and Arabic.",
    locale: "en_US",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "NeoWhisper",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NeoWhisper | Trilingual Tech Blog & IT Services",
    description:
      "Multilingual tech blog and IT services in Japanese, English, and Arabic.",
    images: [`${siteUrl}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

// Declarative pattern table: [regex, language] pairs
const slugPatterns: Array<[RegExp, SupportedLang]> = [
  [/-ja\/?$/, "ja"],
  [/-ar\/?$/, "ar"],
];

function detectBlogSlugLang(pathname: string): SupportedLang | null {
  if (!pathname?.startsWith("/blog/")) return null;
  const match = slugPatterns.find(([pattern]) => pattern.test(pathname));
  return match?.[1] ?? "en";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  // Get language from URL for SSR (set by middleware)
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "/";
  const searchParams = headerList.get("x-search-params") || "";
  const queryLang = normalizeLang(
    new URLSearchParams(searchParams).get("lang")
  ) as SupportedLang;
  const slugLang = detectBlogSlugLang(pathname);
  const lang = slugLang ?? queryLang;
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} className={`${outfit.variable} ${geistMono.variable}`}>
      <head>
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <script
            nonce={nonce}
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
        {/* Client-side RTL direction updater for client-side navigation */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function updateDirection() {
                  const path = window.location.pathname;
                  const search = window.location.search;
                  // Check for Arabic: either from slug suffix or query param
                  const isArabicSlug = /-ar\\/?$/.test(path);
                  const isArabicQuery = search.includes('lang=ar');
                  const isArabic = isArabicSlug || isArabicQuery;
                  // Check for Japanese: either from slug suffix or query param
                  const isJapaneseSlug = /-ja\\/?$/.test(path);
                  const isJapaneseQuery = search.includes('lang=ja');
                  const isJapanese = isJapaneseSlug || isJapaneseQuery;
                  const dir = isArabic ? 'rtl' : 'ltr';
                  const lang = isArabic ? 'ar' : isJapanese ? 'ja' : 'en';
                  if (document.documentElement.dir !== dir) {
                    document.documentElement.dir = dir;
                  }
                  if (document.documentElement.lang !== lang) {
                    document.documentElement.lang = lang;
                  }
                }
                // Update immediately and then poll for changes
                updateDirection();
                setInterval(updateDirection, 100);
              })();
            `,
          }}
        />
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
