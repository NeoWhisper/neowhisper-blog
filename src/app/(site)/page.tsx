/**
 * NeoWhisper - Marketing Home
 * Copyright (c) 2026 Yousif Alqadi
 * Licensed under the MIT License
 */

import Link from "next/link";
import type { Metadata } from "next";
import { getPosts, getBaseSlug } from "@/lib/posts";
import ArticleCard from "@/components/ArticleCard";
import { SITE_URL } from "@/lib/site-config";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";
import { getProjects } from "@/data/projects";

const siteUrl = SITE_URL;

const translations = {
  en: {
    studio: "NEO WHISPER",
    heroTitle: "Build software, launch websites, and scale globally.",
    heroSubtitle:
      "Tokyo-based IT services business (JP/EN/AR) providing software development, game development, app development, web production, web content production, and translation.",
    visitBlog: "Visit the Blog",
    viewProjects: "See Projects",
    viewServices: "View Services",
    servicesTitle: "Services",
    projectsTitle: "Featured Projects",
    projectsCta: "See more →",
    downloadsTitle: "Products & Downloads",
    downloadsCopy:
      "Upcoming apps, tools, and media available on iOS, Android, and desktop platforms.",
    musicTitle: "Music & Media",
    musicCopy:
      "Soundtracks, ambient releases, and creative experiments across Spotify, Apple Music, and YouTube.",
    blogPreviewTitle: "Latest from the Blog",
    blogPreviewCta: "See all →",
    aboutTitle: "About NeoWhisper",
    aboutCopy:
      "NEO WHISPER is a registered sole proprietorship in Japan under the IT services category. We provide software, game, and app development, web production, web content production, and translation services across Japanese, English, and Arabic.",
    contactTitle: "Let's Build Together",
    contactCopy:
      "Tell us about your product or collaboration idea, and we'll help you scope the next steps.",
    contactButton: "Contact Us",
    readBlog: "Read the Blog",
    plannedLabel: "Planned",
    exploreServices: "Explore Services →",
    services: [
      {
        title: "Software & App Development",
        desc: "Web platforms, apps, internal tools, and product MVPs.",
        icon: "💻",
      },
      {
        title: "Game Development",
        desc: "Playable prototypes and polished indie releases.",
        icon: "🎮",
      },
      {
        title: "Translation Services",
        desc: "JP・EN・AR technical and product localization.",
        icon: "🌐",
      },
    ],
    projects: [
      {
        title: "NeoWhisper Blog Platform",
        desc: "Multilingual, SEO-first publishing with premium UI.",
        status: "live",
      },
      {
        title: "Client Dashboards",
        desc: "Operational analytics and workflow tools for teams.",
        status: "planned",
      },
      {
        title: "Indie Game Prototypes",
        desc: "Rapid gameplay experiments with a polished feel.",
        status: "planned",
      },
      {
        title: "Localization Kits",
        desc: "Translation pipelines for EN/JA/AR launches.",
        status: "planned",
      },
    ],
    downloads: ["iOS App Store", "Google Play", "Steam", "macOS"],
    music: ["Spotify", "Apple Music", "YouTube", "Bandcamp"],
  },
  ja: {
    studio: "NEO WHISPER",
    heroTitle: "ソフトウェアとWebを開発し、世界へ。",
    heroSubtitle:
      "東京都港区を拠点とするITサービス業。ソフトウェア開発・ゲーム開発・アプリ開発・Web制作・Webコンテンツ制作・翻訳などのITサービスを提供しています。",
    visitBlog: "ブログを見る",
    viewProjects: "プロジェクトを見る",
    viewServices: "サービスを見る",
    servicesTitle: "サービス",
    projectsTitle: "注目プロジェクト",
    projectsCta: "もっと見る →",
    downloadsTitle: "プロダクト / ダウンロード",
    downloadsCopy:
      "iOS・Android・デスクトップ向けのアプリやツールを準備中です。",
    musicTitle: "音楽・メディア",
    musicCopy:
      "Spotify・Apple Music・YouTubeでサウンドトラックやクリエイティブ作品を公開予定。",
    blogPreviewTitle: "最新記事",
    blogPreviewCta: "すべて見る →",
    aboutTitle: "NeoWhisperについて",
    aboutCopy:
      "NEO WHISPERは日本で登録された個人事業主（ITサービス業）です。ソフトウェア開発・ゲーム開発・アプリ開発・Web制作・Webコンテンツ制作・翻訳などのITサービスを、日本語・英語・アラビア語の3言語で提供しています。",
    contactTitle: "一緒に作りましょう",
    contactCopy:
      "プロダクトやコラボレーションのご相談をお聞かせください。",
    contactButton: "お問い合わせ",
    readBlog: "ブログを読む",
    plannedLabel: "準備中",
    exploreServices: "サービスを見る →",
    services: [
      {
        title: "ソフトウェア・アプリ開発",
        desc: "Webプラットフォーム、アプリ、社内ツール、MVP開発。",
        icon: "💻",
      },
      {
        title: "ゲーム開発",
        desc: "プロトタイプからリリースまで。",
        icon: "🎮",
      },
      {
        title: "翻訳・ローカライズ",
        desc: "JP・EN・ARの技術翻訳とUIローカライズ。",
        icon: "🌐",
      },
    ],
    projects: [
      {
        title: "NeoWhisper ブログプラットフォーム",
        desc: "多言語・SEO最適化のコンテンツ基盤。",
        status: "live",
      },
      {
        title: "クライアントダッシュボード",
        desc: "運用・分析を支える業務ツール。",
        status: "planned",
      },
      {
        title: "インディーゲーム試作",
        desc: "プレイ感重視のプロトタイプ制作。",
        status: "planned",
      },
      {
        title: "ローカライズキット",
        desc: "EN/JA/AR対応の翻訳パイプライン。",
        status: "planned",
      },
    ],
    downloads: ["iOS App Store", "Google Play", "Steam", "macOS"],
    music: ["Spotify", "Apple Music", "YouTube", "Bandcamp"],
  },
  ar: {
    studio: "نيو ويسبر (NEO WHISPER)",
    heroTitle: "نطوّر البرمجيات والويب ونتوسع عالميًا.",
    heroSubtitle:
      "نشاط خدمات تقنية معلومات في طوكيو (اليابانية/الإنجليزية/العربية) يقدم تطوير البرمجيات والألعاب والتطبيقات وإنتاج الويب وإنتاج محتوى الويب والترجمة.",
    visitBlog: "زيارة المدونة",
    viewProjects: "عرض المشاريع",
    viewServices: "عرض الخدمات",
    servicesTitle: "الخدمات",
    projectsTitle: "مشاريع مختارة",
    projectsCta: "المزيد →",
    downloadsTitle: "المنتجات والتنزيلات",
    downloadsCopy:
      "تطبيقات وأدوات قادمة على iOS وAndroid ومنصات سطح المكتب.",
    musicTitle: "الموسيقى والوسائط",
    musicCopy:
      "إصدارات موسيقية وتجارب إبداعية على Spotify وApple Music وYouTube.",
    blogPreviewTitle: "أحدث المقالات",
    blogPreviewCta: "عرض الكل →",
    aboutTitle: "حول NeoWhisper",
    aboutCopy:
      "نيو ويسبر مؤسسة فردية مسجلة ضمن نشاط خدمات تقنية المعلومات في اليابان. نقدم تطوير البرمجيات والألعاب والتطبيقات وإنتاج الويب وإنتاج محتوى الويب والترجمة بثلاث لغات.",
    contactTitle: "لنبدأ مشروعًا معًا",
    contactCopy:
      "أخبرنا عن فكرتك وسنساعدك في تحديد الخطوات القادمة.",
    contactButton: "تواصل معنا",
    readBlog: "اقرأ المدونة",
    plannedLabel: "قريبًا",
    exploreServices: "استكشاف الخدمات →",
    services: [
      {
        title: "تطوير البرمجيات والتطبيقات",
        desc: "منصات ويب وتطبيقات وأدوات داخلية وإطلاق MVP.",
        icon: "💻",
      },
      {
        title: "تطوير الألعاب",
        desc: "نماذج أولية وتجارب لعب مميزة.",
        icon: "🎮",
      },
      {
        title: "الترجمة والتعريب",
        desc: "خدمات EN/JA/AR للمنتجات والمحتوى.",
        icon: "🌐",
      },
    ],
    projects: [
      {
        title: "منصة مدونة NeoWhisper",
        desc: "منصة نشر متعددة اللغات مع SEO قوي.",
        status: "live",
      },
      {
        title: "لوحات تحكم العملاء",
        desc: "أدوات تشغيل وتحليلات للفرق.",
        status: "planned",
      },
      {
        title: "نماذج ألعاب مستقلة",
        desc: "تجارب لعب سريعة مع جودة عالية.",
        status: "planned",
      },
      {
        title: "حزم التعريب",
        desc: "حزم ترجمة وتوطين احترافية.",
        status: "planned",
      },
    ],
    downloads: ["App Store", "Google Play", "Steam", "macOS"],
    music: ["Spotify", "Apple Music", "YouTube", "Bandcamp"],
  },
} as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const copy = translations[currentLang];
  const canonicalPath = currentLang === "en" ? "/" : `/?lang=${currentLang}`;

  return {
    title: copy.heroTitle,
    description: copy.heroSubtitle,
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: "/",
        ja: "/?lang=ja",
        ar: "/?lang=ar",
      },
    },
    openGraph: {
      title: copy.heroTitle,
      description: copy.heroSubtitle,
      url: `${siteUrl}${canonicalPath}`,
      siteName: "NeoWhisper",
      type: "website",
      locale:
        currentLang === "ja"
          ? "ja_JP"
          : currentLang === "ar"
            ? "ar_SA"
            : "en_US",
      alternateLocale: ["en_US", "ja_JP", "ar_SA"].filter((locale) => {
        const currentLocale =
          currentLang === "ja"
            ? "ja_JP"
            : currentLang === "ar"
              ? "ar_SA"
              : "en_US";
        return locale !== currentLocale;
      }),
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
      title: copy.heroTitle,
      description: copy.heroSubtitle,
      images: [`${siteUrl}/og-image.jpg`],
    },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const copy = translations[currentLang];
  const isRTL = currentLang === "ar";
  const allPosts = getPosts();
  const filteredPosts = allPosts.filter((post) => {
    const isAr = post.slug.endsWith("-ar");
    const isJa = post.slug.endsWith("-ja");
    const isEn = !isAr && !isJa;

    const matchers: Record<string, boolean> = {
      ar: isAr,
      ja: isJa,
    };

    return matchers[currentLang] ?? isEn;
  }).filter((post) => getBaseSlug(post.slug) !== "welcome");
  const posts = filteredPosts.slice(0, 3);
  const projects = getProjects(currentLang);

  return (
    <>
      <div className="pointer-events-none absolute -top-32 -right-20 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-slate-400/10 blur-3xl transition-opacity animate-pulse" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8" dir={isRTL ? "rtl" : "ltr"} lang={currentLang}>
        <header className="mb-16 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-purple-500">
            {copy.studio}
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            {copy.heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            {copy.heroSubtitle}
          </p>
          <div
            className="mt-8 flex flex-wrap justify-center gap-4"
            dir="ltr"
          >
            <Link
              href={`/services?lang=${currentLang}`}
              className="inline-flex items-center justify-center rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]"
            >
              {copy.viewServices}
            </Link>
            <Link
              href={`/projects?lang=${currentLang}`}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/70 px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
            >
              {copy.viewProjects}
            </Link>
          </div>
          <div
            className="mt-10 flex flex-wrap justify-center gap-3 text-xs text-gray-500 dark:text-gray-400"
            dir="ltr"
          >
            <Link
              href="/"
              className={`rounded-full border px-3 py-1 font-semibold transition-all duration-300 ${currentLang === "en"
                ? "border-purple-400 bg-purple-600 text-white"
                : "border-white/20 bg-white/60 text-gray-700 hover:bg-white hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                }`}
            >
              English
            </Link>
            <Link
              href="/?lang=ja"
              className={`rounded-full border px-3 py-1 font-semibold transition-all duration-300 ${currentLang === "ja"
                ? "border-purple-400 bg-purple-600 text-white"
                : "border-white/20 bg-white/60 text-gray-700 hover:bg-white hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                }`}
            >
              日本語
            </Link>
            <Link
              href="/?lang=ar"
              className={`rounded-full border px-3 py-1 font-semibold transition-all duration-300 ${currentLang === "ar"
                ? "border-purple-400 bg-purple-600 text-white"
                : "border-white/20 bg-white/60 text-gray-700 hover:bg-white hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                }`}
            >
              العربية
            </Link>
          </div>
        </header>

        <section id="services" className="mb-16">
          <div className="grid gap-6 md:grid-cols-3">
            {copy.services.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/20 bg-white/60 p-6 shadow-lg backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href={`/services?lang=${currentLang}`}
              className="rounded-full border border-white/20 bg-white/70 px-5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
            >
              {copy.exploreServices}
            </Link>
          </div>
        </section>

        <section id="projects" className="mb-16">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {copy.projectsTitle}
            </h2>
            <Link
              href={`/projects?lang=${currentLang}`}
              className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700"
            >
              {copy.projectsCta}
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((item) => (
              <div
                key={item.title}
                className={`rounded-3xl border border-white/20 bg-white/60 p-6 shadow-lg backdrop-blur-lg transition-all duration-300 dark:border-white/10 dark:bg-white/5 ${item.status === "planned"
                  ? "opacity-60 grayscale"
                  : "hover:-translate-y-1 hover:shadow-xl"
                  }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  {item.status === "planned" && (
                    <span className="rounded-full border border-white/30 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-300">
                      {copy.plannedLabel}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="blog-preview" className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {copy.blogPreviewTitle}
            </h2>
            <Link
              href={`/blog?lang=${currentLang}`}
              className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700"
            >
              {copy.blogPreviewCta}
            </Link>
          </div>
          <div className="grid gap-6">
            {posts.map((post) => (
              <ArticleCard key={post.slug} post={post} lang={currentLang} />
            ))}
          </div>
        </section>

        <section id="about" className="mb-16">
          <div className="rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {copy.aboutTitle}
            </h2>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              {copy.aboutCopy}
            </p>
          </div>
        </section>

        <section id="contact" className="mb-20">
          <div className="rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {copy.contactTitle}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {copy.contactCopy}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/contact?lang=${currentLang}`}
                className="rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]"
              >
                {copy.contactButton}
              </Link>
              <Link
                href={`/blog?lang=${currentLang}`}
                className="rounded-full border border-white/20 bg-white/70 px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
              >
                {copy.readBlog}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
