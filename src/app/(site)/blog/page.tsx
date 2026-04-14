/**
 * NeoWhisper - Modern Tech Blog
 * Copyright (c) 2026 Yousif Alqadi
 * Licensed under the MIT License
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getBaseSlug } from "@/lib/posts";
import ArticleCard from "@/components/ArticleCard";
import CategoryNav from "@/components/CategoryNav";
import EmailSubscriptionForm from "@/components/EmailSubscriptionForm";
import { buildCategorySlug } from "@/lib/categories";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";
import { getHybridPosts } from "@/lib/posts-hybrid";
import { SITE_URL } from "@/lib/site-config";

const siteUrl = SITE_URL;

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
  qualityTitle: string;
  qualitySummary: string;
  qualityBullets: [string, string, string];
  qualityCta: string;
  subscriptionHeading: string;
  subscriptionDescription: string;
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
    qualityTitle: "Editorial Quality Standards",
    qualitySummary:
      "Every article is reviewed for practical depth, production relevance, and multilingual clarity before publication.",
    qualityBullets: [
      "Hands-on implementation details",
      "Security and performance verification",
      "EN/JA/AR localization review",
    ],
    qualityCta: "Read Editorial Policy",
    subscriptionHeading: "Newsletter",
    subscriptionDescription:
      "Subscribe to receive each new English post in your inbox.",
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
    qualityTitle: "編集品質基準",
    qualitySummary:
      "公開前に、実装の実用性・本番適用性・多言語品質をチェックしています。",
    qualityBullets: [
      "実装ベースの具体的な手順",
      "セキュリティと性能の検証",
      "EN/JA/ARの翻訳品質レビュー",
    ],
    qualityCta: "編集ポリシーを見る",
    subscriptionHeading: "ニュースレター",
    subscriptionDescription:
      "日本語の記事をメールで受け取りたい場合はこちらから登録できます。",
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
    qualityTitle: "معايير الجودة التحريرية",
    qualitySummary:
      "كل مقال يمر بمراجعة عملية من ناحية العمق التقني، وقابلية التطبيق الإنتاجي، وجودة التوطين متعدد اللغات.",
    qualityBullets: [
      "خطوات تنفيذ عملية",
      "تحقق من الأمان والأداء",
      "مراجعة جودة EN/JA/AR",
    ],
    qualityCta: "قراءة سياسة التحرير",
    subscriptionHeading: "النشرة البريدية",
    subscriptionDescription:
      "اشترك لتصلك المقالات العربية الجديدة مباشرة عبر البريد الإلكتروني.",
  },
};

const localeByLang: Record<SupportedLang, string> = {
  en: "en_US",
  ja: "ja_JP",
  ar: "ar_SA",
};

function buildPostUrl(
  slug: string,
  locale: SupportedLang,
  source: "static" | "dynamic",
): string {
  const encodedSlug = encodeURIComponent(slug);
  if (source === "dynamic") {
    if (locale === "en") return `${siteUrl}/blog/${encodedSlug}`;
    return `${siteUrl}/blog/${encodedSlug}?lang=${locale}`;
  }
  return `${siteUrl}/blog/${encodedSlug}`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const copy = copyByLang[currentLang];
  const locale = localeByLang[currentLang];
  const canonicalPath = currentLang === "en" ? "/blog" : `/blog?lang=${currentLang}`;
  const canonicalUrl = `${siteUrl}${canonicalPath}`;

  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    authors: [{ name: "NeoWhisper Team" }],
    openGraph: {
      title: copy.ogTitle,
      description: copy.ogDescription,
      url: canonicalUrl,
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
      canonical: canonicalPath,
      languages: {
        en: "/blog",
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
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const copy = copyByLang[currentLang];
  const isRTL = currentLang === "ar";

  const filteredPosts = (await getHybridPosts(currentLang)).filter(
    (post) => getBaseSlug(post.slug) !== "welcome",
  );

  const uniqueCategories = Array.from(
    new Set(filteredPosts.map((post) => post.category))
  )
    .filter((category): category is string => Boolean(category))
    .map((category) => ({
      name: category,
      slug: buildCategorySlug(category),
    }));
  const blogHomeUrl =
    currentLang === "en" ? `${siteUrl}/blog` : `${siteUrl}/blog?lang=${currentLang}`;
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: filteredPosts.slice(0, 12).map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: buildPostUrl(post.slug, post.locale, post.source),
      name: post.title,
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: currentLang === "en" ? `${siteUrl}/` : `${siteUrl}/?lang=${currentLang}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: copy.blogName,
        item: blogHomeUrl,
      },
    ],
  };
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: copy.blogName,
    description: copy.schemaDescription,
    url: blogHomeUrl,
    inLanguage: currentLang,
    publisher: {
      "@type": "Organization",
      name: "NeoWhisper",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/og-image.jpg`,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mx-auto max-w-5xl" dir={isRTL ? "rtl" : "ltr"}>
        <header className="mb-12 text-center">
          <div className="mb-6 flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <Link
              href={currentLang === "en" ? "/" : `/?lang=${currentLang}`}
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
              href="/blog"
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

        <section className="mb-10">
          <div className="rounded-3xl border border-white/20 bg-white/60 p-6 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {copy.qualityTitle}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {copy.qualitySummary}
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-gray-700 dark:text-gray-200 md:grid-cols-3">
              {copy.qualityBullets.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-gray-200/70 bg-white/70 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/40"
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className={`mt-4 ${isRTL ? "text-right" : "text-left"}`}>
              <Link
                href={`/editorial-policy?lang=${currentLang}`}
                className="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                {copy.qualityCta}
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div
            className="rounded-3xl border border-white/20 bg-white/60 p-8 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-white/5"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div className={`${isRTL ? "text-right" : "text-left"} mb-6`}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-500">
                {copy.subscriptionHeading}
              </p>
              <p className="mt-3 text-base text-gray-700 dark:text-gray-200">
                {copy.subscriptionDescription}
              </p>
            </div>
            <EmailSubscriptionForm lang={currentLang} />
          </div>
        </section>

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
