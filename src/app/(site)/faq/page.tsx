import Link from "next/link";
import { Metadata } from "next";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site-config";

const baseUrl = SITE_URL;

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQContent {
  title: string;
  subtitle: string;
  back: string;
  items: FAQItem[];
  contactCta: string;
  contactButton: string;
}

const content: Record<SupportedLang, FAQContent> = {
  en: {
    title: "Frequently Asked Questions",
    subtitle: "Common questions about NeoWhisper services and blog content.",
    back: "← Back to Home",
    contactCta: "Still have questions? We're here to help.",
    contactButton: "Contact Us",
    items: [
      {
        question: "What services does NeoWhisper provide?",
        answer: "NeoWhisper is a registered IT services business in Tokyo, Japan. We provide software development, game development, app development, web production, web content production, and translation/localization services in Japanese, English, and Arabic.",
      },
      {
        question: "How can I hire NeoWhisper for a project?",
        answer: "You can reach out through our Contact page with details about your project. We'll review your requirements and respond with a scope and timeline proposal. We work with clients globally.",
      },
      {
        question: "Is the blog content free to use?",
        answer: "Yes, all blog content is free to read and reference. Our technical tutorials and guides are published under standard copyright with the intention of helping the developer community. Please credit NeoWhisper when sharing.",
      },
      {
        question: "Do you offer translation services for technical content?",
        answer: "Yes, we specialize in technical translation between English, Japanese, and Arabic. This includes documentation, UI strings, marketing materials, and technical blog posts. Contact us for a quote.",
      },
      {
        question: "How often is new content published?",
        answer: "We publish new technical articles regularly, focusing on quality over quantity. Our AI trend briefs are published daily with curated tech news across all three languages.",
      },
      {
        question: "Can I subscribe to get notified of new posts?",
        answer: "Yes! You can subscribe to our newsletter on the Blog page. We send notifications for new English posts. For Japanese and Arabic content, the subscription options are available in their respective language sections.",
      },
      {
        question: "What technologies does NeoWhisper specialize in?",
        answer: "We specialize in modern web development technologies including Next.js, React, TypeScript, and Node.js. Our blog focuses on practical guides and production-ready implementations.",
      },
      {
        question: "Is NeoWhisper a registered business?",
        answer: "Yes, NeoWhisper is a registered sole proprietorship (個人事業主) in Minato City, Tokyo, Japan, operating under the IT services business category.",
      },
    ],
  },
  ja: {
    title: "よくある質問",
    subtitle: "NeoWhisperのサービスとブログコンテンツに関するよくあるご質問。",
    back: "← ホームへ戻る",
    contactCta: "他にご質問がありますか？お気軽にご連絡ください。",
    contactButton: "お問い合わせ",
    items: [
      {
        question: "NeoWhisperはどのようなサービスを提供していますか？",
        answer: "NeoWhisperは東京都港区に登録されたITサービス業の個人事業主です。ソフトウェア開発、ゲーム開発、アプリ開発、Web制作、Webコンテンツ制作、そして日本語・英語・アラビア語の翻訳・ローカライズサービスを提供しています。",
      },
      {
        question: "プロジェクトのご依頼はどうすればよいですか？",
        answer: "お問い合わせページからプロジェクトの詳細をお送りください。ご要件を確認した上で、スコープとスケジュールのご提案をお返しします。グローバルなクライアントとお仕事しています。",
      },
      {
        question: "ブログコンテンツは無料で利用できますか？",
        answer: "はい、すべてのブログコンテンツは無料で読んで参照できます。技術チュートリアルとガイドは、開発者コミュニティの助けになることを目的として標準的な著作権のもとで公開されています。共有される際はNeoWhisperへのクレジットをお願いします。",
      },
      {
        question: "技術文書の翻訳サービスは提供していますか？",
        answer: "はい、英語・日本語・アラビア語間の技術翻訳を専門としています。ドキュメント、UI文言、マーケティング資料、技術ブログ記事などが対象です。お見積りはお問い合わせください。",
      },
      {
        question: "新しいコンテンツはどのくらいの頻度で公開されますか？",
        answer: "技術記事は品質を重視して定期的に公開しています。AIトレンドブリーフは3言語で毎日、厳選されたテックニュースをお届けしています。",
      },
      {
        question: "新しい記事の通知を受け取ることはできますか？",
        answer: "はい！ブログページからニュースレターにご登録いただけます。新しい英語記事の通知をお送りします。日本語・アラビア語コンテンツについても、それぞれの言語セクションで購読オプションがございます。",
      },
      {
        question: "NeoWhisperはどの技術を専門としていますか？",
        answer: "Next.js、React、TypeScript、Node.jsなどのモダンWeb開発技術を専門としています。ブログでは実用的なガイドと本番環境での実装に焦点を当てています。",
      },
      {
        question: "NeoWhisperは登録された事業者ですか？",
        answer: "はい、NeoWhisperは東京都港区に登録された個人事業主（個人事業主）で、ITサービス業として営業しています。",
      },
    ],
  },
  ar: {
    title: "الأسئلة الشائعة",
    subtitle: "أسئلة شائعة حول خدمات NeoWhisper ومحتوى المدونة.",
    back: "← العودة للرئيسية",
    contactCta: "هل لديك أسئلة أخرى؟ نحن هنا للمساعدة.",
    contactButton: "تواصل معنا",
    items: [
      {
        question: "ما هي الخدمات التي تقدمها NeoWhisper؟",
        answer: "NeoWhisper هو نشاط خدمات تقنية معلومات مسجل في ميناتو-كو، طوكيو، اليابان. نقدم تطوير البرمجيات والألعاب والتطبيقات، وإنتاج الويب ومحتوى الويب، وخدمات الترجمة والتعريب باليابانية والإنجليزية والعربية.",
      },
      {
        question: "كيف يمكنني التعاقد مع NeoWhisper لمشروع؟",
        answer: "يمكنك التواصل معنا عبر صفحة التواصل مع تفاصيل مشروعك. سنراجع متطلباتك ونرد باقتراح للنطاق والجدول الزمني. نعمل مع العملاء على مستوى العالم.",
      },
      {
        question: "هل محتوى المدونة مجاني للاستخدام؟",
        answer: "نعم، جميع محتوى المدونة مجاني للقراءة والمرجع. نشر الدروس والأدلة التقنية بموجب حقوق النشر القياسية بهدف مساعدة مجتمع المطورين. يرجى ذكر NeoWhisper عند المشاركة.",
      },
      {
        question: "هل تقدمون خدمات ترجمة للمحتوى التقني؟",
        answer: "نعم، نحن متخصصون في الترجمة التقنية بين الإنجليزية واليابانية والعربية. يشمل ذلك الوثائق، نصوص واجهة المستخدم، المواد التسويقية، والمقالات التقنية. تواصل معنا للحصول على عرض سعر.",
      },
      {
        question: "كم مرة يتم نشر محتوى جديد؟",
        answer: "ننشر مقالات تقنية جديدة بانتظام مع التركيز على الجودة بدلاً من الكمية. نشر موجزات AI Trend يومياً بأخبار تقنية مختارة بثلاث لغات.",
      },
      {
        question: "هل يمكنني الاشتراك لاستلام إشعارات بالمقالات الجديدة؟",
        answer: "نعم! يمكنك الاشتراك في نشرتنا الإخبارية من صفحة المدونة. نرسل إشعارات للمقالات الإنجليزية الجديدة. خيارات الاشتراك للمحتوى الياباني والعربي متاحة في أقسام اللغة الخاصة بها.",
      },
      {
        question: "ما هي التقنيات التي تتخصص فيها NeoWhisper؟",
        answer: "نتخصص في تقنيات تطوير الويب الحديثة بما في ذلك Next.js وReact وTypeScript وNode.js. تركز مدونتنا على الأدلة العملية والتطبيقات الجاهزة للإنتاج.",
      },
      {
        question: "هل NeoWhisper شركة مسجلة؟",
        answer: "نعم، NeoWhisper مؤسسة فردية مسجلة في ميناتو-كو، طوكيو، اليابان، تعمل في فئة خدمات تقنية المعلومات.",
      },
    ],
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const c = content[currentLang];

  return {
    title: c.title,
    description: c.subtitle,
    alternates: {
      canonical: currentLang === "en" ? "/faq" : `/faq?lang=${currentLang}`,
    },
    openGraph: {
      title: c.title,
      description: c.subtitle,
      url: `${baseUrl}${currentLang === "en" ? "/faq" : `/faq?lang=${currentLang}`}`,
      type: "website",
    },
  };
}

export default async function FAQPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const c = content[currentLang];
  const isRTL = currentLang === "ar";

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 px-4 py-16 sm:px-6 lg:px-8"
      dir={isRTL ? "rtl" : "ltr"}
      lang={currentLang}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-500">
              FAQ
            </p>
            <h1 className="mt-3 text-4xl font-extrabold text-gray-900 dark:text-white">
              {c.title}
            </h1>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              {c.subtitle}
            </p>
          </div>
          <Link
            href={`/?lang=${currentLang}`}
            className="rounded-full border border-white/20 bg-white/70 px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
          >
            {c.back}
          </Link>
        </div>

        <div className="space-y-4">
          {c.items.map((item, index) => (
            <details
              key={index}
              className="group rounded-3xl border border-white/20 bg-white/60 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-white/5"
            >
              <summary className="flex cursor-pointer items-center justify-between p-6 text-lg font-semibold text-gray-900 dark:text-white [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span className="ml-4 flex-shrink-0 rounded-full border border-gray-200 bg-white p-1 transition-all duration-300 group-open:rotate-180 group-open:border-purple-500 group-open:bg-purple-500 dark:border-gray-700 dark:bg-gray-800">
                  <svg
                    className="h-4 w-4 text-gray-500 group-open:text-white dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </summary>
              <div className="border-t border-gray-200 px-6 pb-6 pt-4 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-white/20 bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center dark:border-white/10">
          <p className="text-lg font-semibold text-white">{c.contactCta}</p>
          <Link
            href={`/contact?lang=${currentLang}`}
            className="mt-4 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-purple-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            {c.contactButton}
          </Link>
        </div>
      </div>
    </div>
  );
}
