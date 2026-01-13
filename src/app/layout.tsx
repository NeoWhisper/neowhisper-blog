import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github-dark.css"; // Syntax highlighting theme
import Script from "next/script";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
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
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${outfit.variable} font-sans antialiased`}
      >
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
