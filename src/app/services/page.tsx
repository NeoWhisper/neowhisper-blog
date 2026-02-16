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
        title: "Software & Tools Development",
        description:
          "Custom software solutions, automation tools, and integrated systems for business operations.",
        bullets: [
          "Internal dashboards",
          "Automation tools",
          "API integrations",
        ],
      },
      {
        title: "Game Development",
        description:
          "Interactive experiences and game prototypes built for engagement and polish.",
        bullets: [
          "Casual mobile prototypes",
          "Indie game MVPs",
          "Production vertical slices",
        ],
      },
      {
        title: "Web & Content Production",
        description:
          "Modern web platforms and content systems optimized for clarity and reach.",
        bullets: [
          "Corporate sites",
          "Landing pages",
          "Multilingual blogs (like NeoWhisper Blog)",
        ],
      },
      {
        title: "Translation & Localization (EN/AR/JP)",
        description:
          "Seamless adaptation of products and content for global audiences with technical accuracy.",
        bullets: [
          "App UI strings",
          "Technical documentation",
          "Marketing pages",
        ],
      },
    ],
    cta: "Tell me about your project",
  },
  ja: {
    label: "サービス",
    title: "提供できること",
    subtitle: "プレミアムな開発力と多言語対応で成果に繋げます。",
    back: "ホームへ戻る",
    cards: [
      {
        title: "ソフトウェア・ツール開発",
        description: "業務効率を改善するカスタムソフトウェアや自動化ツール、API連携システムを構築します。",
        bullets: ["社内ダッシュボード", "業務自動化ツール", "各種API連携"],
      },
      {
        title: "ゲーム開発",
        description: "エンゲージメントを高めるインタラクティブな体験や、高品質なゲームプロトタイプを制作します。",
        bullets: ["カジュアルゲーム試作", "インディーゲームMVP", "垂直スライス版制作"],
      },
      {
        title: "Web・コンテンツ制作",
        description: "情報の伝わりやすさとリーチを追求した、モダンなWebプラットフォームとコンテンツ基盤を提供します。",
        bullets: ["コーポレートサイト", "ランディングページ", "多言語ブログ（NeoWhisper Blogなど）"],
      },
      {
        title: "翻訳・ローカライズ (日/英/阿)",
        description: "グローバルに展開する製品やコンテンツを、技術的正確さを保ちつつ多言語へ最適化します。",
        bullets: ["アプリUI文言", "技術ドキュメント", "マーケティングページ"],
      },
    ],
    cta: "プロジェクトについて相談する",
  },
  ar: {
    label: "الخدمات",
    title: "خدماتنا",
    subtitle: "تنفيذ احترافي وتجارب متعددة اللغات تناسب احتياجاتك.",
    back: "العودة للرئيسية",
    cards: [
      {
        title: "تطوير البرمجيات والأدوات",
        description: "حلول برمجية مخصصة، أدوات أتمتة، وأنظمة متكاملة لعمليات الأعمال.",
        bullets: ["لوحات تحكم داخلية", "أدوات الأتمتة", "ربط واجهات API"],
      },
      {
        title: "تطوير الألعاب",
        description: "تجارب تفاعلية ونماذج ألعاب أولية مبنية بجودة وإتقان.",
        bullets: ["نماذج ألعاب موبايل", "نسخ MVP للألعاب", "تطوير أنظمة اللعب"],
      },
      {
        title: "إنتاج الويب والمحتوى",
        description: "منصات ويب حديثة وأنظمة محتوى محسنة للوضوح والوصول.",
        bullets: ["مواقع شركات", "صفحات هبوط (Landing Pages)", "مدونات متعددة اللغات"],
      },
      {
        title: "الترجمة والتعريب (EN/AR/JP)",
        description: "تكييف المنتجات والمحتوى للجمهور العالمي بدقة تقنية عالية.",
        bullets: ["نصوص الواجهات", "الوثائق التقنية", "صفحات التسويق"],
      },
    ],
    cta: "أخبرني عن مشروعك",
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

        <div className="mt-16 flex justify-center">
          <Link
            href={`/contact?lang=${currentLang}`}
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-4 px-10 font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <span className="absolute inset-0 h-full w-full bg-gradient-to-br from-purple-600 to-pink-600"></span>
            <span className="absolute bottom-0 right-0 mb-32 mr-4 block h-64 w-64 origin-bottom-left translate-x-24 rotate-45 transform rounded-full bg-white opacity-10 transition-all duration-500 ease-out group-hover:mb-0 group-hover:mr-0"></span>
            <span className="relative text-sm uppercase tracking-widest">{t.cta}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
