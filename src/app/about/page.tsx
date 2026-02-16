import Link from "next/link";
import { Metadata } from "next";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

const translations = {
  en: {
    label: "About",
    title: "The Visionary Studio",
    subtitle: "Bridging Japan and the Middle East through multilingual tech.",
    intro: "NEO WHISPER is a registered IT services sole proprietorship based in Minato City, Tokyo, founded in December 2025 by Alqadi Yousif Mohammed A.",
    back: "Back to Home",
    sections: [
      {
        title: "Who we are",
        copy: "A Tokyo-based full-stack developer and consultant working across Japanese, English, and Arabic. We specialize in building digital products that blend technical engineering with cultural strategy, focusing on high-polish web, games, and AI tools."
      },
      {
        title: "What we do",
        copy: "We provide end-to-end software development, indie game prototyping, multilingual content production, and deep localization services. We help clients launch products that feel native in three languages from day one."
      },
      {
        title: "Why we exist",
        copy: "To bridge the gap between Japan and the Middle East. We believe that multilingual technology, games, and digital products can connect cultures and create new opportunities in the global digital economy."
      }
    ],
    address: "Registered address: Minato-ku, Tokyo",
    visitBlog: "Visit the Blog",
    contact: "Contact Us",
  },
  ja: {
    label: "概要",
    title: "ビジョナリー・スタジオ",
    subtitle: "多言語技術で日本と中東を繋ぐ架け橋へ。",
    intro: "NEO WHISPERは、2025年12月に東京都港区にてアルカディ・ユセフ・ムハンマド・A（Alqadi Yousif Mohammed A.）により設立された、ITサービスを提供する登録済みの個人事業主です。",
    back: "ホームへ戻る",
    sections: [
      {
        title: "私たちについて",
        copy: "東京都を拠点に、日本語・英語・アラビア語の3ヶ国語で活動するフルスタックデベロッパー兼コンサルタントです。技術的なエンジニアリングと文化的戦略を融合させ、高品質なWeb・ゲーム・AIツールの構築を専門としています。"
      },
      {
        title: "事業内容",
        copy: "ソフトウェア開発、インディーゲームの試作、多言語コンテンツ制作、そして高度なローカライズサービスを提供。初日から3ヶ国語でネイティブに感じられる製品の立ち上げを支援します。"
      },
      {
        title: "理念",
        copy: "日本と中東の距離を縮めること。多言語技術、ゲーム、デジタルプロダクトは文化を繋ぎ、グローバルなデジタル経済における新しい機会を創出できると信じています。"
      }
    ],
    address: "登録住所: 東京都港区",
    visitBlog: "ブログを見る",
    contact: "お問い合わせ",
  },
  ar: {
    label: "نبذة",
    title: "الرؤية والاستوديو",
    subtitle: "سد الفجوة بين اليابان والشرق الأوسط عبر التقنيات متعددة اللغات.",
    intro: "نيو ويسبر (NEO WHISPER) هي مؤسسة فردية مسجلة لخدمات تقنية المعلومات مقرها في مدينة ميناتو، طوكيو، تأسست في ديسمبر 2025 من قبل القاضي يوسف محمد أ.",
    back: "العودة للرئيسية",
    sections: [
      {
        title: "من نحن",
        copy: "مطور برمجيات متكامل (Full-stack) ومستشار تقني مقيم في طوكيو، نعمل باللغات اليابانية والإنجليزية والعربية. نتخصص في بناء منتجات رقمية تمزج بين الهندسة التقنية والاستراتيجية الثقافية، مع التركيز على الويب والألعاب وأدوات الذكاء الاصطناعي."
      },
      {
        title: "ماذا نفعل",
        copy: "نقدم تطوير البرمجيات من البداية للنهاية، نماذج الألعاب الأولية، إنتاج المحتوى متعدد اللغات، وخدمات التعريب العميقة. نساعد العملاء على إطلاق منتجات تبدو كأنها صُممت محليًا بثلاث لغات منذ اليوم الأول."
      },
      {
        title: "لماذا نحن هنا",
        copy: "لربط اليابان والشرق الأوسط. نؤمن بأن التقنيات متعددة اللغات والألعاب والمنتجات الرقمية يمكنها ربط الثقافات وخلق فرص جديدة في الاقتصاد الرقمي العالمي."
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
                  Ready to bridge the gap and build something world-class? Let&apos;s talk about your next project.
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
