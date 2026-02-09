import Link from "next/link";
import { Metadata } from "next";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

const translations = {
  en: {
    label: "Services",
    title: "What We Deliver",
    subtitle:
      "Premium engineering, creative direction, and multilingual delivery.",
    back: "Back to Home",
    cards: [
      {
        title: "Full-Stack Product Development",
        description:
          "Strategy, UX, and engineering for modern web platforms and internal tools.",
        bullets: ["Next.js + TypeScript", "MVP to scale", "SEO-first builds"],
      },
      {
        title: "Game Development",
        description:
          "Rapid prototyping, vertical slices, and production-ready game loops.",
        bullets: ["Unity / Godot", "Mobile + PC", "Polished UI/UX"],
      },
      {
        title: "Localization & Translation",
        description:
          "Native-level EN/JA/AR translation with technical accuracy.",
        bullets: [
          "Product UI copy",
          "Docs and tutorials",
          "Launch localization",
        ],
      },
      {
        title: "Content & Growth Systems",
        description:
          "Editorial strategy and SEO pipelines for long-term visibility.",
        bullets: ["Keyword strategy", "Content ops", "Analytics + GA4"],
      },
    ],
  },
  ja: {
    label: "サービス",
    title: "提供できること",
    subtitle: "プレミアムな開発力と多言語対応で成果に繋げます。",
    back: "ホームへ戻る",
    cards: [
      {
        title: "フルスタック開発",
        description:
          "Webプロダクトや社内ツールを、戦略から実装まで一貫して支援します。",
        bullets: ["Next.js + TypeScript", "MVPからスケール", "SEO重視の構成"],
      },
      {
        title: "ゲーム開発",
        description: "試作からリリースまで、プレイ感を重視した制作を行います。",
        bullets: ["Unity / Godot", "モバイル + PC", "UI/UX最適化"],
      },
      {
        title: "翻訳・ローカライズ",
        description:
          "EN/JA/ARの技術翻訳と製品ローカライズをネイティブ品質で提供。",
        bullets: ["UIコピー", "ドキュメント", "ローンチ対応"],
      },
      {
        title: "コンテンツ＆成長支援",
        description: "SEOと編集戦略で継続的な流入を作ります。",
        bullets: ["キーワード設計", "制作フロー", "GA4分析"],
      },
    ],
  },
  ar: {
    label: "الخدمات",
    title: "خدماتنا",
    subtitle: "تنفيذ احترافي وتجارب متعددة اللغات تناسب السوق السعودي.",
    back: "العودة للرئيسية",
    cards: [
      {
        title: "تطوير المنتجات الرقمية",
        description: "نحوّل الأفكار إلى منصات ويب ومنتجات داخلية قابلة للنمو.",
        bullets: ["Next.js + TypeScript", "من MVP إلى التوسع", "تهيئة SEO"],
      },
      {
        title: "تطوير الألعاب",
        description: "نماذج أولية وتجارب لعب متقنة جاهزة للإطلاق.",
        bullets: ["Unity / Godot", "موبايل وكمبيوتر", "واجهة وتجربة عالية"],
      },
      {
        title: "الترجمة والتعريب",
        description: "تعريب احترافي للمنتجات والمحتوى بدقة تقنية عالية.",
        bullets: ["نصوص الواجهة", "الوثائق", "تحضير الإطلاق"],
      },
      {
        title: "نمو المحتوى والسيو",
        description: "استراتيجية تحرير وتحسين الظهور لضمان نتائج مستمرة.",
        bullets: ["أبحاث الكلمات", "عمليات المحتوى", "تحليلات GA4"],
      },
    ],
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
      title: "Services - NeoWhisper | Full-Stack Development & Localization",
      description:
        "Premium full-stack development, game development, EN/JA/AR localization, and content strategy. Next.js experts delivering SEO-first web platforms and multilingual products.",
    },
    ja: {
      title: "サービス - NeoWhisper | フルスタック開発・多言語対応",
      description:
        "フルスタック開発、ゲーム開発、EN/JA/AR翻訳・ローカライズ、コンテンツ戦略。Next.jsの専門家がSEO重視のWebプラットフォームと多言語製品を提供します。",
    },
    ar: {
      title: "الخدمات - NeoWhisper | تطوير متكامل وتعريب احترافي",
      description:
        "تطوير مواقع وتطبيقات متكاملة، تطوير ألعاب، ترجمة وتعريب EN/JA/AR، واستراتيجية محتوى. خبراء Next.js في تقديم منصات ويب محسّنة لمحركات البحث ومنتجات متعددة اللغات.",
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
        en: "/services?lang=en",
        ja: "/services?lang=ja",
        ar: "/services?lang=ar",
      },
    },
  };
}

export default async function ServicesPage({
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
      <div className="mx-auto max-w-6xl">
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
          {t.cards.map((service) => (
            <article
              key={service.title}
              className="rounded-3xl border border-white/20 bg-white/60 p-6 shadow-lg backdrop-blur-lg dark:border-white/10 dark:bg-white/5"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {service.title}
              </h2>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                {service.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {service.bullets.map((bullet) => (
                  <span
                    key={bullet}
                    className="rounded-full border border-white/30 bg-white/70 px-3 py-1 text-xs font-semibold text-gray-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-200"
                  >
                    {bullet}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
