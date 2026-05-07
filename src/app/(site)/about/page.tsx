import Link from "next/link";
import { Metadata } from "next";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site-config";

const baseUrl = SITE_URL;

const translations = {
  en: {
    label: "About",
    title: "Professional Profile",
    subtitle: "Registered in Japan as an IT services sole proprietorship.",
    intro: "NEO WHISPER is a Tokyo-based sole proprietorship delivering multilingual IT services with a truth-first operating approach.",
    back: "Back to Home",
    identityTitle: "Business Identity",
    identity: [
      "Trade Name: NEO WHISPER",
      "Founder: ALQADI YOUSIF MOHAMMED A",
      "Business Category: IT Services (ITサービス業)",
      "Opened: 2025-12",
      "Location: Minato City, Tokyo",
    ],
    principlesTitle: "Operating Principles",
    principles: [
      "Truth-first delivery: no inflated claims, no unsupported numbers.",
      "Multilingual execution: Japanese, English, and Arabic communication and production.",
      "Practical scope control: clear deliverables from requirements to handoff.",
    ],
    sections: [
      {
        title: "Who we are",
        copy: "A registered sole proprietorship in Minato City, Tokyo, operating as an IT services business across Japanese, English, and Arabic."
      },
      {
        title: "What we do",
        copy: "Service scope: software development, game development, app development, web production, web content production, and translation/localization."
      },
      {
        title: "Business focus",
        copy: "Deliver practical IT services with strong multilingual execution for JP/EN/AR markets."
      }
    ],
    address: "Registered address: Minato-ku, Tokyo",
    visitBlog: "Visit the Blog",
    contact: "Contact Us",
  },
  ja: {
    label: "概要",
    title: "ITサービス個人事業",
    subtitle: "開業届上の職業区分: ITサービス業。",
    intro: "NEO WHISPERは、東京を拠点に多言語でITサービスを提供する個人事業です。誇張のない実務重視の方針で運営しています。",
    back: "ホームへ戻る",
    identityTitle: "事業者情報",
    identity: [
      "屋号: NEO WHISPER",
      "代表者: ALQADI YOUSIF MOHAMMED A",
      "職業区分: ITサービス業",
      "開業: 2025年12月",
      "所在地: 東京都港区",
    ],
    principlesTitle: "運営方針",
    principles: [
      "誇張しない説明: 根拠のない数値や実績表現を行わない。",
      "多言語実行: 日本語・英語・アラビア語で一貫対応。",
      "実務スコープ重視: 要件整理から引き渡しまでを明確化。",
    ],
    sections: [
      {
        title: "私たちについて",
        copy: "東京都港区を拠点に、税務署へ開業届を提出済みの個人事業として、日本語・英語・アラビア語の3言語でITサービスを提供しています。"
      },
      {
        title: "事業内容",
        copy: "ソフトウェア開発・ゲーム開発・アプリ開発・Web制作・Webコンテンツ制作・翻訳などのITサービスを提供します。"
      },
      {
        title: "事業フォーカス",
        copy: "JP/EN/AR市場向けに、実務で使えるITサービスを多言語で正確に提供すること。"
      }
    ],
    address: "登録住所: 東京都港区",
    visitBlog: "ブログを見る",
    contact: "お問い合わせ",
  },
  ar: {
    label: "نبذة",
    title: "نشاط خدمات تقنية معلومات مسجل",
    subtitle: "نشاط مسجل في اليابان ضمن خدمات تقنية المعلومات.",
    intro: "نيو ويسبر (NEO WHISPER) مؤسسة فردية في طوكيو تقدم خدمات تقنية معلومات متعددة اللغات بمنهج عملي قائم على الدقة.",
    back: "العودة للرئيسية",
    identityTitle: "الهوية المهنية",
    identity: [
      "الاسم التجاري: NEO WHISPER",
      "المؤسس: ALQADI YOUSIF MOHAMMED A",
      "فئة النشاط: خدمات تقنية معلومات (ITサービス業)",
      "تاريخ البدء: 2025-12",
      "الموقع: مدينة ميناتو، طوكيو",
    ],
    principlesTitle: "مبادئ التشغيل",
    principles: [
      "تنفيذ قائم على الحقيقة: بدون مبالغة وبدون أرقام غير موثقة.",
      "تنفيذ متعدد اللغات: اليابانية والإنجليزية والعربية.",
      "ضبط نطاق عملي: مخرجات واضحة من المتطلبات حتى التسليم.",
    ],
    sections: [
      {
        title: "من نحن",
        copy: "مؤسسة فردية مسجلة في ميناتو-كو، طوكيو، تعمل كنشاط خدمات تقنية معلومات بثلاث لغات: اليابانية والإنجليزية والعربية."
      },
      {
        title: "ماذا نفعل",
        copy: "نقدم تطوير البرمجيات وتطوير الألعاب وتطوير التطبيقات وإنتاج الويب وإنتاج محتوى الويب والترجمة والتعريب ضمن نطاق خدمات تقنية المعلومات."
      },
      {
        title: "تركيز النشاط",
        copy: "تقديم خدمات تقنية معلومات عملية بدقة تنفيذ عالية للأسواق اليابانية والإنجليزية والعربية."
      }
    ],
    address: "العنوان المسجل: مدينة ميناتو، طوكيو",
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
      title: "About - NeoWhisper | IT Services Business",
      description:
        "Registered IT services sole proprietorship in Tokyo. Service scope includes software development, game development, app development, web production, web content production, and translation.",
    },
    ja: {
      title: "概要 - NeoWhisper | ITサービス個人事業",
      description:
        "NeoWhisperは東京都港区を拠点とするITサービス個人事業主です。税務署へ開業届を提出済みで、ソフトウェア開発・ゲーム開発・アプリ開発・Web制作・Webコンテンツ制作・翻訳などを提供します。",
    },
    ar: {
      title: "عن NeoWhisper | نشاط خدمات تقنية معلومات",
      description:
        "نيو ويسبر مؤسسة فردية مسجلة لخدمات تقنية المعلومات في طوكيو. يشمل نطاق الخدمات تطوير البرمجيات والألعاب والتطبيقات وإنتاج الويب ومحتوى الويب والترجمة.",
    },
  };

  const { title, description } = meta[currentLang];
  const canonicalPath = currentLang === "en" ? "/about" : `/about?lang=${currentLang}`;

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
        en: "/about",
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
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 italic">
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

        <div className="mb-12 rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
          <p className="text-lg font-medium leading-relaxed text-gray-900 dark:text-white">
            {t.intro}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-purple-500">
            {t.address}
          </p>
        </div>

        <section className="mb-8 rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.identityTitle}</h2>
          <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {t.identity.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-12 rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.principlesTitle}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-300">
            {t.principles.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          {t.sections.map((section) => (
            <div key={section.title} className="rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {section.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {section.copy}
              </p>
            </div>
          ))}

          <div className="rounded-3xl border border-white/20 bg-purple-600/5 p-8 backdrop-blur-lg dark:border-white/10 md:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Work with NEO WHISPER
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  If you need practical multilingual IT execution, let&apos;s discuss your next project.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/blog?lang=${currentLang}`}
                  className="rounded-full bg-white/70 px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-white dark:bg-white/5 dark:text-gray-200"
                >
                  {t.visitBlog}
                </Link>
                <Link
                  href={`/contact?lang=${currentLang}`}
                  className="rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]"
                >
                  {t.contact}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
