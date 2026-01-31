/**
 * NeoWhisper - Modern Tech Blog
 * Copyright (c) 2026 Yousif Alqadi
 * Licensed under the MIT License
 */

import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github-dark.css"; // Syntax highlighting theme
import Script from "next/script";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "NeoWhisper - Tech Blog",
  description: "Full-stack development with trilingual support (日本語・English・العربية).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body
        className={`${outfit.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <div className="flex-1">
          <GoogleAnalytics />
          {children}
        </div>
        <footer className="border-t border-white/5 bg-black/40 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-xs text-zinc-400">
            <span>© 2026 NeoWhisper. All rights reserved.</span>
            <span>Built with Next.js and MDX.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
