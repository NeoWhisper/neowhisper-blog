/**
 * NeoWhisper - Modern Tech Blog
 * Copyright (c) 2026 Yousif Alqadi
 * Licensed under the MIT License
 */

import type { Metadata } from 'next';
import { getPosts } from '@/lib/posts';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import CategoryNav from '@/components/CategoryNav';
import { AdSenseAd } from '@/components/AdSenseAd';
import { buildCategorySlug } from '@/lib/categories';

const siteUrl = 'https://www.neowhisper.net';

export const metadata: Metadata = {
  title: 'NeoWhisper - Tech Blog | Next.js, React, TypeScript Tutorials',
  description:
    '日本語とEnglishの技術ブログ。Next.js、React、TypeScriptのチュートリアルとWeb開発のベストプラクティスを紹介。Bilingual tech tutorials and web development guides.',
  authors: [{ name: 'NeoWhisper Team' }],
  openGraph: {
    title: 'NeoWhisper Tech Blog',
    description: 'Bilingual tech tutorials and web development guides',
    url: siteUrl,
    siteName: 'NeoWhisper',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'NeoWhisper Tech Blog',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeoWhisper Tech Blog',
    description: 'Bilingual tech tutorials and web development',
    images: [`${siteUrl}/og-image.jpg`],
  },
  other: {
    keywords:
      'Next.js, React, TypeScript, Web Development, JavaScript, 技術ブログ, チュートリアル',
  },
};


export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const posts = getPosts();
  const { lang } = await searchParams;
  const currentLang = lang || 'en';
  const isRTL = currentLang === 'ar';

  const filteredPosts = posts.filter((post) => {
    const isAr = post.slug.endsWith('-ar');
    const isJa = post.slug.endsWith('-ja');
    const isEn = !isAr && !isJa;

    const matchers: Record<string, boolean> = {
      ar: isAr,
      ja: isJa,
    };

    return matchers[currentLang] ?? isEn;
  });

  // Extract unique categories from filteredPosts
  const uniqueCategories = Array.from(new Set(filteredPosts.map(post => post.category)))
    .filter((category): category is string => Boolean(category))
    .map(category => ({
      name: category,
      slug: buildCategorySlug(category)
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'NeoWhisper',
            description:
              'Tech blog with tutorials on Next.js, React, and TypeScript',
            url: siteUrl,
            inLanguage: ['ja', 'en', 'ar'],
            publisher: {
              '@type': 'Organization',
              name: 'NeoWhisper',
              logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/logo.png`,
              },
            },
          }),
        }}
      />
      <div className="max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 sm:text-6xl mb-4">
            NeoWhisper
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Full-stack development with trilingual support.
          </p>

          {/* Language Filter */}
          <div className="flex justify-center gap-4">
            <Link
              href="/?lang=en"
              className={`px-4 py-2 rounded-full transition-colors ${currentLang === 'en'
                ? 'bg-purple-600 text-white'
                : 'bg-white/50 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/20'
                }`}
            >
              English
            </Link>
            <Link
              href="/?lang=ja"
              className={`px-4 py-2 rounded-full transition-colors ${currentLang === 'ja'
                ? 'bg-purple-600 text-white'
                : 'bg-white/50 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/20'
                }`}
            >
              日本語
            </Link>
            <Link
              href="/?lang=ar"
              className={`px-4 py-2 rounded-full transition-colors ${currentLang === 'ar'
                ? 'bg-purple-600 text-white'
                : 'bg-white/50 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/20'
                }`}
            >
              العربية
            </Link>
          </div>
        </header>

        <CategoryNav categories={uniqueCategories} />

        <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-3">💻</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Software Development</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Custom apps, web systems, and business tools</p>
          </div>
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Game Development</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Mobile games and indie projects</p>
          </div>
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-3">🌐</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Translation Services</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">JP・EN・AR technical translation</p>
          </div>
        </section>

        <section className="mb-16">
          <AdSenseAd slot="5462294096" />
        </section>

        <section>
          <h2 className={`text-3xl font-bold text-gray-900 dark:text-white mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
            {currentLang === 'ja' ? '最新記事' : currentLang === 'ar' ? 'أحدث المقالات' : 'Latest Articles'}
          </h2>
          {filteredPosts.length > 0 ? (
            <div className="grid gap-8">
              {filteredPosts.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No posts found for this language.
              </p>
            </div>
          )}
        </section>
      </div >
    </div >
  );
}
