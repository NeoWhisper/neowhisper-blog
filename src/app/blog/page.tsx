/**
 * NeoWhisper - Modern Tech Blog
 * Copyright (c) 2026 Yousif Alqadi
 * Licensed under the MIT License
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/posts";
import ArticleCard from "@/components/ArticleCard";
import CategoryNav from "@/components/CategoryNav";
import { AdSenseAd } from "@/components/AdSenseAd";
import { buildCategorySlug } from "@/lib/categories";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

const siteUrl = "https://www.neowhisper.net";

export const metadata: Metadata = {
  title: "NeoWhisper Blog | Next.js, React, TypeScript Tutorials",
  description:
    "日本語とEnglishの技術ブログ。Next.js、React、TypeScriptのチュートリアルとWeb開発のベストプラクティスを紹介。Bilingual tech tutorials and web development guides.",
  authors: [{ name: "NeoWhisper Team" }],
  openGraph: {
    title: "NeoWhisper Tech Blog",
    description: "Bilingual tech tutorials and web development guides",
    url: `${siteUrl}/blog`,
    siteName: "NeoWhisper",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "NeoWhisper Tech Blog",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeoWhisper Tech Blog",
    description: "Bilingual tech tutorials and web development",
    images: [`${siteUrl}/og-image.jpg`],
  },
  other: {
    keywords:
      "Next.js, React, TypeScript, Web Development, JavaScript, 技術ブログ, チュートリアル",
  },
};

export default async function BlogHome({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const posts = getPosts();
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const isRTL = currentLang === "ar";

  const filteredPosts = posts.filter((post) => {
    const isAr = post.slug.endsWith("-ar");
    const isJa = post.slug.endsWith("-ja");
    const isEn = !isAr && !isJa;

    const matchers: Record<string, boolean> = {
      ar: isAr,
      ja: isJa,
    };

    return matchers[currentLang] ?? isEn;
  });

  const uniqueCategories = Array.from(
    new Set(filteredPosts.map((post) => post.category))
  )
    .filter((category): category is string => Boolean(category))
    .map((category) => ({
      name: category,
      slug: buildCategorySlug(category),
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "NeoWhisper",
            description:
              "Tech blog with tutorials on Next.js, React, and TypeScript",
            url: siteUrl,
            inLanguage: ["ja", "en", "ar"],
            publisher: {
              "@type": "Organization",
              name: "NeoWhisper",
              logo: {
                "@type": "ImageObject",
                url: `${siteUrl}/logo.png`,
              },
            },
          }),
        }}
      />

      <div className="mx-auto max-w-5xl" dir={isRTL ? "rtl" : "ltr"}>
        <header className="mb-12 text-center">
          <div className="mb-6 flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <Link
              href={`/?lang=${currentLang}`}
              className="rounded-full border border-white/20 bg-white/60 px-3 py-1 font-medium text-gray-700 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
            >
              ← Back to Home
            </Link>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">NeoWhisper Blog</span>
          </div>

          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 sm:text-6xl mb-4">
            Tech Blog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Deep technical guides, product experiments, and multilingual content
            for builders.
          </p>

          <div className="relative z-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/blog?lang=en"
              className={`px-4 py-2 rounded-full transition-all duration-300 border text-sm font-semibold ${
                currentLang === "en"
                  ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                  : "bg-white/70 dark:bg-white/10 text-gray-700 dark:text-gray-200 border-white/30 dark:border-white/10 hover:bg-white hover:shadow-md"
              }`}
            >
              English
            </Link>
            <Link
              href="/blog?lang=ja"
              className={`px-4 py-2 rounded-full transition-all duration-300 border text-sm font-semibold ${
                currentLang === "ja"
                  ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                  : "bg-white/70 dark:bg-white/10 text-gray-700 dark:text-gray-200 border-white/30 dark:border-white/10 hover:bg-white hover:shadow-md"
              }`}
            >
              日本語
            </Link>
            <Link
              href="/blog?lang=ar"
              className={`px-4 py-2 rounded-full transition-all duration-300 border text-sm font-semibold ${
                currentLang === "ar"
                  ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                  : "bg-white/70 dark:bg-white/10 text-gray-700 dark:text-gray-200 border-white/30 dark:border-white/10 hover:bg-white hover:shadow-md"
              }`}
            >
              العربية
            </Link>
          </div>
        </header>

        <CategoryNav categories={uniqueCategories} lang={currentLang} />

        <section className="mb-12">
          <AdSenseAd slot="5462294096" />
        </section>

        <section>
          <h2
            className={`text-3xl font-bold text-gray-900 dark:text-white mb-8 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {currentLang === "ja"
              ? "最新記事"
              : currentLang === "ar"
              ? "أحدث المقالات"
              : "Latest Articles"}
          </h2>
          {filteredPosts.length > 0 ? (
            <div className="grid gap-8">
              {filteredPosts.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/60 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No posts found for this language.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
