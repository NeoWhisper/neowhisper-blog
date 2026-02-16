/**
 * NeoWhisper - Modern Tech Blog
 * Copyright (c) 2026 Yousif Alqadi
 * Licensed under the MIT License
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getPosts, getBaseSlug } from "@/lib/posts";
import ArticleCard from "@/components/ArticleCard";
import CategoryNav from "@/components/CategoryNav";
import { buildCategorySlug } from "@/lib/categories";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

const siteUrl = "https://www.neowhisper.net";

type BlogCopy = {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  keywords: string;
  backToHome: string;
  blogName: string;
  heroTitle: string;
  heroSubtitle: string;
  latestArticles: string;
  noPosts: string;
  schemaDescription: string;
};

const copyByLang: Record<SupportedLang, BlogCopy> = {
  en: {
    metaTitle: "NeoWhisper Blog | Next.js, React, TypeScript Tutorials",
    metaDescription:
      "Deep technical guides on Next.js, React, TypeScript, and modern web development best practices.",
    ogTitle: "NeoWhisper Tech Blog",
    ogDescription: "Technical guides, experiments, and multilingual content.",
    keywords:
      "Next.js, React, TypeScript, Web Development, JavaScript, technical blog, tutorials",
    backToHome: "← Back to Home",
    blogName: "NeoWhisper Blog",
    heroTitle: "Tech Blog",
    heroSubtitle:
      "Deep technical guides, product experiments, and multilingual content for builders.",
    latestArticles: "Latest Articles",
    noPosts: "No posts found for this language.",
    schemaDescription:
      "Tech blog with tutorials on Next.js, React, and TypeScript.",
  },
  ja: {
    metaTitle: "NeoWhisper ブログ | Next.js・React・TypeScript チュートリアル",
    metaDescription:
      "Next.js、React、TypeScriptを中心に、実践的な技術ガイドとWeb開発のベストプラクティスを発信。",
    ogTitle: "NeoWhisper テックブログ",
    ogDescription: "技術ガイド、実験、そして多言語コンテンツ。",
    keywords:
      "Next.js, React, TypeScript, Web開発, 技術ブログ, チュートリアル",
    backToHome: "← ホームへ戻る",
    blogName: "NeoWhisper ブログ",
    heroTitle: "テックブログ",
    heroSubtitle:
      "実践的な技術ガイド、プロダクト実験、多言語コンテンツを発信しています。",
    latestArticles: "最新記事",
    noPosts: "この言語の投稿はまだありません。",
    schemaDescription:
      "Next.js、React、TypeScriptのチュートリアルを掲載する技術ブログ。",
  },
  ar: {
    metaTitle: "مدونة NeoWhisper | دروس Next.js وReact وTypeScript",
    metaDescription:
      "أدلة تقنية معمقة حول Next.js وReact وTypeScript وأفضل ممارسات تطوير الويب الحديثة.",
    ogTitle: "مدونة NeoWhisper التقنية",
    ogDescription: "أدلة تقنية وتجارب منتجات ومحتوى متعدد اللغات.",
    keywords:
      "Next.js, React, TypeScript, تطوير الويب, مدونة تقنية, دروس",
    backToHome: "العودة للرئيسية →",
    blogName: "مدونة NeoWhisper",
    heroTitle: "المدونة التقنية",
    heroSubtitle:
      "أدلة تقنية متعمقة وتجارب منتجات ومحتوى متعدد اللغات لصنّاع المنتجات.",
    latestArticles: "أحدث المقالات",
    noPosts: "لا توجد مقالات متاحة لهذه اللغة حالياً.",
    schemaDescription:
      "مدونة تقنية تضم دروساً حول Next.js وReact وTypeScript.",
  },
};

const localeByLang: Record<SupportedLang, string> = {
  en: "en_US",
  ja: "ja_JP",
  ar: "ar_SA",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const copy = copyByLang[currentLang];
  const locale = localeByLang[currentLang];

  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    authors: [{ name: "NeoWhisper Team" }],
    openGraph: {
      title: copy.ogTitle,
      description: copy.ogDescription,
      url: `${siteUrl}/blog`,
      siteName: "NeoWhisper",
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: copy.ogTitle,
        },
      ],
      locale,
      alternateLocale: Object.values(localeByLang).filter((l) => l !== locale),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: copy.ogTitle,
      description: copy.ogDescription,
      images: [`${siteUrl}/og-image.jpg`],
    },
    other: {
      keywords: copy.keywords,
    },
    alternates: {
      languages: {
        en: "/blog?lang=en",
        ja: "/blog?lang=ja",
        ar: "/blog?lang=ar",
      },
    },
  };
}

export default async function BlogHome({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const posts = getPosts();
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const copy = copyByLang[currentLang];
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
  }).filter((post) => getBaseSlug(post.slug) !== "welcome");

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
            description: copy.schemaDescription,
            url: siteUrl,
            inLanguage: ["ja", "en", "ar"],
            publisher: {
              "@type": "Organization",
              name: "NeoWhisper",
              logo: {
                "@type": "ImageObject",
                url: `${siteUrl}/og-image.jpg`,
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
              {copy.backToHome}
            </Link>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{copy.blogName}</span>
          </div>

          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 sm:text-6xl mb-4">
            {copy.heroTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            {copy.heroSubtitle}
          </p>

          <div
            className="relative z-10 flex flex-wrap justify-center gap-3"
            dir="ltr"
          >
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

        <section>
          <h2
            className={`text-3xl font-bold text-gray-900 dark:text-white mb-8 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {copy.latestArticles}
          </h2>
          {filteredPosts.length > 0 ? (
            <div className="grid gap-8">
              {filteredPosts.map((post) => (
                <ArticleCard key={post.slug} post={post} lang={currentLang} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/60 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {copy.noPosts}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
