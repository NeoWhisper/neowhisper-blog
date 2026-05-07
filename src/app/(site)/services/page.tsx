import Link from "next/link";
import { Metadata } from "next";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site-config";

const baseUrl = SITE_URL;

const translations = {
  en: {
    label: "Services",
    title: "Now Delivering",
    subtitle: "Current service scope you can request today.",
    back: "Back to Home",
    nowTitle: "Now Delivering",
    inProgressTitle: "In Progress",
    plannedTitle: "Planned",
    flowTitle: "Delivery Flow",
    flow: "Discovery -> Scope -> Build -> Handoff",
    nowCards: [
      {
        title: "Software and Web Application Development",
        description:
          "Custom business systems, internal tools, and web applications tailored to operational needs.",
        includes: "Includes: scope definition, implementation, testing, deployment support.",
        excludes: "Not included by default: long-term 24/7 operations, enterprise compliance audits.",
      },
      {
        title: "Game Development",
        description:
          "Casual mobile prototypes and small indie gameplay builds for concept validation.",
        includes: "Includes: gameplay prototype, iteration passes, build packaging.",
        excludes: "Not included by default: full live-ops pipelines and large studio outsourcing.",
      },
      {
        title: "Web Production and Content Systems",
        description:
          "Corporate sites, landing pages, and multilingual content platforms.",
        includes: "Includes: UX structure, implementation, CMS/blog workflow setup.",
        excludes: "Not included by default: high-volume ad media operations.",
      },
      {
        title: "Translation & Localization (EN/AR/JP)",
        description:
          "Technical translation and software localization for English, Arabic, and Japanese.",
        includes: "Includes: UI strings, documentation, and product content localization.",
        excludes: "Not included by default: legal-certified translation services.",
      },
    ],
    inProgress: [
      "Client dashboard templates for workflow and analytics are being refined.",
    ],
    planned: [
      "Reusable localization kits for recurring EN/JA/AR launch workflows.",
    ],
    cta: "Start a Project",
  },
  ja: {
    label: "サービス",
    title: "現在提供中のサービス",
    subtitle: "今日ご相談いただける提供範囲です。",
    back: "ホームへ戻る",
    nowTitle: "現在提供中",
    inProgressTitle: "進行中",
    plannedTitle: "計画",
    flowTitle: "提供フロー",
    flow: "ヒアリング -> 要件定義 -> 開発 -> 引き渡し",
    nowCards: [
      {
        title: "ソフトウェア・Webアプリ開発",
        description: "業務システム、社内ツール、Webアプリを要件に合わせて実装します。",
        includes: "含まれるもの: 要件整理、実装、テスト、公開支援。",
        excludes: "標準では含まれないもの: 24時間運用保守、監査対応。",
      },
      {
        title: "ゲーム開発",
        description: "スマホ向けカジュアルゲーム試作や小規模インディー開発に対応します。",
        includes: "含まれるもの: プロトタイプ制作、改善反映、ビルド提供。",
        excludes: "標準では含まれないもの: 大規模ライブ運用体制の代行。",
      },
      {
        title: "Web・コンテンツ制作",
        description: "企業サイト、LP、多言語コンテンツ基盤を設計・実装します。",
        includes: "含まれるもの: 情報設計、実装、CMS/ブログ運用構成。",
        excludes: "標準では含まれないもの: 大量広告メディア運用。",
      },
      {
        title: "翻訳・ローカライズ (日本語/英語/アラビア語)",
        description: "英語・アラビア語・日本語の技術翻訳とプロダクト向けローカライズを提供します。",
        includes: "含まれるもの: UI文言、技術文書、製品コンテンツ。",
        excludes: "標準では含まれないもの: 法的証明付き翻訳。",
      },
    ],
    inProgress: [
      "業務分析と可視化向けダッシュボード雛形を現在整備中です。",
    ],
    planned: [
      "EN/JA/ARの反復案件向けローカライズキットを計画中です。",
    ],
    cta: "プロジェクト相談を始める",
  },
  ar: {
    label: "الخدمات",
    title: "الخدمات المتاحة الآن",
    subtitle: "هذا هو نطاق الخدمات الذي يمكن طلبه اليوم.",
    back: "العودة للرئيسية",
    nowTitle: "متاح الآن",
    inProgressTitle: "قيد التنفيذ",
    plannedTitle: "مخطط",
    flowTitle: "آلية التنفيذ",
    flow: "اكتشاف -> تحديد نطاق -> بناء -> تسليم",
    nowCards: [
      {
        title: "تطوير البرمجيات وتطبيقات الويب",
        description: "نطوّر أنظمة أعمال وأدوات داخلية وتطبيقات ويب حسب متطلبات التشغيل.",
        includes: "يشمل: تحديد النطاق، التنفيذ، الاختبار، ودعم الإطلاق.",
        excludes: "لا يشمل افتراضياً: تشغيل 24/7 أو تدقيقات امتثال مؤسسية.",
      },
      {
        title: "تطوير الألعاب",
        description: "نماذج أولية للألعاب المحمولة وتطوير ألعاب مستقلة صغيرة.",
        includes: "يشمل: نموذج لعب أولي، جولات تحسين، وتسليم نسخ البناء.",
        excludes: "لا يشمل افتراضياً: إدارة تشغيل مباشر واسعة النطاق.",
      },
      {
        title: "إنتاج الويب وأنظمة المحتوى",
        description: "تنفيذ مواقع الشركات وصفحات الهبوط ومنصات محتوى متعددة اللغات.",
        includes: "يشمل: هيكلة المحتوى، التنفيذ، وإعداد سير تشغيل المنصة.",
        excludes: "لا يشمل افتراضياً: تشغيل إعلام إعلاني عالي الحجم.",
      },
      {
        title: "الترجمة والتعريب (EN/AR/JP)",
        description: "ترجمة تقنية وتعريب برمجي بين الإنجليزية والعربية واليابانية.",
        includes: "يشمل: نصوص الواجهة، الوثائق التقنية، ومحتوى المنتج.",
        excludes: "لا يشمل افتراضياً: الترجمة القانونية الموثقة.",
      },
    ],
    inProgress: [
      "نعمل حالياً على قوالب لوحات تشغيلية لمتابعة المهام والتحليلات.",
    ],
    planned: [
      "إعداد حزم تعريب قابلة لإعادة الاستخدام لمشاريع EN/JA/AR المتكررة.",
    ],
    cta: "ابدأ طلب مشروع",
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
        "IT services including software development, game development, app development, web production, web content production, and EN/JA/AR translation/localization.",
    },
    ja: {
      title: "サービス - NeoWhisper | フルスタック開発・多言語対応",
      description:
        "ソフトウェア開発・ゲーム開発・アプリ開発・Web制作・Webコンテンツ制作・EN/JA/AR翻訳・ローカライズなど、ITサービス業としての提供内容を掲載。",
    },
    ar: {
      title: "الخدمات - NeoWhisper | تطوير متكامل وتعريب احترافي",
      description:
        "خدمات تقنية معلومات تشمل تطوير البرمجيات والألعاب والتطبيقات وإنتاج الويب ومحتوى الويب والترجمة والتعريب EN/JA/AR.",
    },
  };

  const { title, description } = meta[currentLang];
  const canonicalPath = currentLang === "en" ? "/services" : `/services?lang=${currentLang}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}${canonicalPath}`,
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
      canonical: canonicalPath,
      languages: {
        en: "/services",
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

        <section className="mb-8 rounded-3xl border border-white/20 bg-purple-600/5 p-6 dark:border-white/10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.flowTitle}</h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{t.flow}</p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{t.nowTitle}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {t.nowCards.map((service) => (
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
              <div className="mt-4 space-y-2 text-xs">
                <p className="rounded-xl border border-white/20 bg-white/70 px-3 py-2 text-gray-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-200">
                  {service.includes}
                </p>
                <p className="rounded-xl border border-white/20 bg-white/70 px-3 py-2 text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                  {service.excludes}
                </p>
              </div>
            </article>
            ))}
          </div>
        </section>

        <section className="mb-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-white/20 bg-white/50 p-6 dark:border-white/10 dark:bg-white/5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.inProgressTitle}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-300">
              {t.inProgress.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-3xl border border-white/20 bg-white/50 p-6 dark:border-white/10 dark:bg-white/5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.plannedTitle}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-300">
              {t.planned.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

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
