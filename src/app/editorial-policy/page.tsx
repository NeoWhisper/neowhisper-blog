import type { Metadata } from "next";
import Link from "next/link";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

type PolicyCopy = {
  title: string;
  description: string;
  back: string;
  sections: Array<{
    title: string;
    items: string[];
  }>;
  contact: string;
  contactCta: string;
};

const copyByLang: Record<SupportedLang, PolicyCopy> = {
  en: {
    title: "Editorial Policy",
    description:
      "How NeoWhisper creates, reviews, and updates technical content for readers.",
    back: "Back to Home",
    sections: [
      {
        title: "Originality",
        items: [
          "We publish practical guides based on real implementation experience.",
          "We avoid thin, auto-generated, or duplicate content.",
          "Each article aims to provide actionable code, reasoning, and outcomes.",
        ],
      },
      {
        title: "Accuracy and Updates",
        items: [
          "We verify examples against current framework and tooling versions.",
          "If guidance changes, we revise posts and examples.",
          "We correct factual or technical errors when reported.",
        ],
      },
      {
        title: "Transparency",
        items: [
          "We clearly separate educational content from advertising.",
          "Sponsored content is not published without explicit labeling.",
          "Recommendations are based on technical suitability, not ad pressure.",
        ],
      },
    ],
    contact: "Need a correction or clarification?",
    contactCta: "Contact Editorial Team",
  },
  ja: {
    title: "編集ポリシー",
    description:
      "NeoWhisperが技術記事を作成・レビュー・更新する方針について。",
    back: "ホームへ戻る",
    sections: [
      {
        title: "独自性",
        items: [
          "実装経験に基づく実践的なガイドを公開します。",
          "薄い内容・自動生成・重複コンテンツは避けます。",
          "各記事で、実行可能なコードと判断理由を示します。",
        ],
      },
      {
        title: "正確性と更新",
        items: [
          "現行のフレームワーク/ツールのバージョンで検証します。",
          "前提が変わった場合は記事とサンプルを更新します。",
          "報告された事実誤認や技術的誤りは修正します。",
        ],
      },
      {
        title: "透明性",
        items: [
          "教育コンテンツと広告を明確に分離します。",
          "スポンサー記事は明示なしに公開しません。",
          "推奨は広告都合ではなく技術的妥当性を優先します。",
        ],
      },
    ],
    contact: "修正提案や補足が必要ですか？",
    contactCta: "編集チームへ連絡",
  },
  ar: {
    title: "سياسة التحرير",
    description: "كيف ينشئ NeoWhisper المحتوى التقني ويُراجعه ويُحدّثه.",
    back: "العودة للرئيسية",
    sections: [
      {
        title: "الأصالة",
        items: [
          "ننشر أدلة عملية مبنية على خبرة تنفيذ فعلية.",
          "نتجنب المحتوى الضعيف أو المكرر أو المُولّد آلياً.",
          "كل مقال يجب أن يقدم خطوات قابلة للتطبيق ونتائج واضحة.",
        ],
      },
      {
        title: "الدقة والتحديث",
        items: [
          "نراجع الأمثلة على إصدارات حديثة من الأدوات والأطر.",
          "نحدّث المقالات عندما تتغير المتطلبات التقنية.",
          "نصحح الأخطاء التقنية أو المعلوماتية عند الإبلاغ عنها.",
        ],
      },
      {
        title: "الشفافية",
        items: [
          "نفصل بوضوح بين المحتوى التعليمي والإعلانات.",
          "لا ننشر محتوى مدفوعاً دون توضيح صريح.",
          "التوصيات مبنية على الملاءمة التقنية وليس ضغط الإعلانات.",
        ],
      },
    ],
    contact: "هل لديك تصحيح أو ملاحظة؟",
    contactCta: "تواصل مع فريق التحرير",
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const copy = copyByLang[currentLang];

  return {
    title: `${copy.title} | NeoWhisper`,
    description: copy.description,
    alternates: {
      languages: {
        en: "/editorial-policy?lang=en",
        ja: "/editorial-policy?lang=ja",
        ar: "/editorial-policy?lang=ar",
      },
    },
  };
}

export default async function EditorialPolicyPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const copy = copyByLang[currentLang];
  const isRTL = currentLang === "ar";

  return (
    <main
      className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"
      dir={isRTL ? "rtl" : "ltr"}
      lang={currentLang}
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {copy.title}
        </h1>
        <Link
          href={`/?lang=${currentLang}`}
          className="rounded-full border border-white/20 bg-white/70 px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
        >
          {copy.back}
        </Link>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-200">
        {copy.description}
      </p>

      <div className="mt-8 space-y-8">
        {copy.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {section.title}
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-white/20 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
        <p className="text-sm text-gray-700 dark:text-gray-200">{copy.contact}</p>
        <Link
          href={`/contact?lang=${currentLang}`}
          className="mt-3 inline-flex rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white"
        >
          {copy.contactCta}
        </Link>
      </section>
    </main>
  );
}
