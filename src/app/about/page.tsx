import Link from "next/link";
import { Metadata } from "next";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

const translations = {
  en: {
    label: "About",
    title: "NeoWhisper Studio",
    subtitle: "We build multilingual products that feel premium and ship fast.",
    back: "Back to Home",
    focusTitle: "Our Focus",
    focusCopy:
      "NeoWhisper blends product engineering, content strategy, and localization to launch across English, Japanese, and Arabic.",
    focusBullets: [
      "Full-stack web platforms",
      "Game and interactive experiences",
      "Multilingual content systems",
    ],
    workTitle: "How We Work",
    workCopy:
      "We ship fast, validate early, and refine with a kaizen mindset. Each build is designed to scale globally with strong SEO and performance.",
    workBullets: [
      "Sprint-based delivery",
      "Premium visual systems",
      "Metrics-driven iteration",
    ],
    nextTitle: "What's Next",
    nextCopy:
      "We're expanding our product catalog with apps, creative tools, and audio releases. Follow the blog to see what we're building.",
    visitBlog: "Visit the Blog",
    contact: "Contact Us",
  },
  ja: {
    label: "概要",
    title: "NeoWhisper Studio",
    subtitle: "プレミアム品質とスピード感で多言語プロダクトを届けます。",
    back: "ホームへ戻る",
    focusTitle: "私たちの強み",
    focusCopy:
      "NeoWhisperは、プロダクト開発・コンテンツ戦略・ローカライズを統合し、英日アラビア語での展開を支援します。",
    focusBullets: [
      "フルスタックWeb開発",
      "ゲームとインタラクティブ制作",
      "多言語コンテンツ運用",
    ],
    workTitle: "進め方",
    workCopy:
      "スプリントで素早く検証し、改善を積み重ねるスタイルです。SEOとパフォーマンスを前提に設計します。",
    workBullets: [
      "スプリント型デリバリー",
      "プレミアムなビジュアル設計",
      "データで改善",
    ],
    nextTitle: "これから",
    nextCopy:
      "アプリ・クリエイティブツール・音楽などの新しいプロダクトを準備中です。最新情報はブログへ。",
    visitBlog: "ブログを見る",
    contact: "お問い合わせ",
  },
  ar: {
    label: "نبذة",
    title: "NeoWhisper Studio",
    subtitle: "نصنع منتجات متعددة اللغات بجودة عالية وسرعة تنفيذ.",
    back: "العودة للرئيسية",
    focusTitle: "تركيزنا",
    focusCopy:
      "نمزج بين تطوير المنتجات واستراتيجية المحتوى والتعريب لإطلاق عالمي يدعم الإنجليزية واليابانية والعربية.",
    focusBullets: [
      "منصات ويب متكاملة",
      "تجارب ألعاب وتفاعلية",
      "أنظمة محتوى متعددة اللغات",
    ],
    workTitle: "أسلوب عملنا",
    workCopy:
      "ننجز بسرعة، نختبر مبكرًا، ونحسن بشكل مستمر بروح كايزن. كل منتج مصمم للنمو عالميًا.",
    workBullets: [
      "تنفيذ بنظام السبرنت",
      "تصميم بصري فاخر",
      "تحسين قائم على البيانات",
    ],
    nextTitle: "القادم",
    nextCopy:
      "نعمل على إطلاق تطبيقات وأدوات إبداعية وإصدارات صوتية جديدة. تابع المدونة لمعرفة كل جديد.",
    visitBlog: "زيارة المدونة",
    contact: "تواصل معنا",
  },
} as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;

  const meta = {
    en: {
      title: "About - NeoWhisper | Multilingual Product Studio",
      description:
        "NeoWhisper builds premium web platforms, games, and multilingual products across English, Japanese, and Arabic. Full-stack development with SEO-first approach and kaizen mindset.",
    },
    ja: {
      title: "概要 - NeoWhisper | 多言語プロダクト開発スタジオ",
      description:
        "NeoWhisperは、英語・日本語・アラビア語に対応したプレミアムなWebプラットフォーム、ゲーム、多言語製品を構築します。SEO重視のフルスタック開発と改善マインドを持つスタジオです。",
    },
    ar: {
      title: "عن NeoWhisper | استوديو منتجات متعددة اللغات",
      description:
        "NeoWhisper يبني منصات ويب وألعاب ومنتجات متعددة اللغات بجودة عالية عبر الإنجليزية واليابانية والعربية. تطوير متكامل مع نهج يركز على SEO وعقلية التحسين المستمر.",
    },
  };

  const { title, description } = meta[currentLang];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale:
        currentLang === "ja"
          ? "ja_JP"
          : currentLang === "ar"
            ? "ar_SA"
            : "en_US",
      alternateLocale: ["en_US", "ja_JP", "ar_SA"].filter(
        (loc) =>
          loc !==
          (currentLang === "ja"
            ? "ja_JP"
            : currentLang === "ar"
              ? "ar_SA"
              : "en_US"),
      ),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      languages: {
        en: "/about?lang=en",
        ja: "/about?lang=ja",
        ar: "/about?lang=ar",
      },
    },
  };
}

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const t = translations[currentLang];
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 px-4 py-16 sm:px-6 lg:px-8"
      dir={currentLang === "ar" ? "rtl" : "ltr"}
      lang={currentLang}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-500">
              {t.label}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold text-gray-900 dark:text-white">
              {t.title}
            </h1>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              {t.subtitle}
            </p>
          </div>
          <Link
            href={`/?lang=${currentLang}`}
            className="rounded-full border border-white/20 bg-white/70 px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
          >
            {t.back}
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.focusTitle}
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              {t.focusCopy}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {t.focusBullets.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.workTitle}
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              {t.workCopy}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {t.workBullets.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-lg dark:border-white/10 dark:bg-white/5 md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.nextTitle}
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              {t.nextCopy}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/blog?lang=${currentLang}`}
                className="rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]"
              >
                {t.visitBlog}
              </Link>
              <Link
                href={`/contact?lang=${currentLang}`}
                className="rounded-full border border-white/20 bg-white/70 px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
              >
                {t.contact}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
