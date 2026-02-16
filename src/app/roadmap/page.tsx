import Link from "next/link";
import { Metadata } from "next";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

const translations = {
    en: {
        label: "Roadmap",
        title: "Client Roadmap",
        subtitle:
            "How we plan, build, and deliver IT services from kickoff to launch.",
        back: "Back to Home",
        sections: [
            {
                title: "Discovery & Scope",
                items: [
                    "Clarify business goals, technical requirements, and target users.",
                    "Define scope, timeline, and delivery phases before implementation.",
                    "Plan multilingual coverage across Japanese, English, and Arabic when needed.",
                ],
            },
            {
                title: "Build & Quality",
                items: [
                    "Execute software, web, app, and game development in iterative milestones.",
                    "Produce web content and translation/localization aligned with product goals.",
                    "Run validation for quality, performance, and production readiness.",
                ],
            },
            {
                title: "Launch & Support",
                items: [
                    "Deploy, verify, and hand over with clear documentation.",
                    "Support onboarding and operational transition for your team.",
                    "Provide optional ongoing improvements and maintenance plans.",
                ],
            },
        ],
        ctaTitle: "Need a roadmap for your project?",
        ctaLink: "Contact us ->",
    },
    ja: {
        label: "ロードマップ",
        title: "クライアント向けロードマップ",
        subtitle:
            "ITサービスを、要件定義から公開・運用までどのように進めるかを示します。",
        back: "ホームへ戻る",
        sections: [
            {
                title: "ヒアリングと要件定義",
                items: [
                    "事業目標、要件、対象ユーザーを明確化します。",
                    "実装前に、スコープ・スケジュール・納品フェーズを定義します。",
                    "必要に応じて、日本語・英語・アラビア語の多言語対応方針を設計します。",
                ],
            },
            {
                title: "開発・制作・検証",
                items: [
                    "ソフトウェア、Web、アプリ、ゲーム開発を段階的に実施します。",
                    "プロダクト目的に合わせてWebコンテンツ制作と翻訳・ローカライズを行います。",
                    "品質・性能・本番運用性の観点で検証を実施します。",
                ],
            },
            {
                title: "公開・運用支援",
                items: [
                    "公開後の確認を行い、ドキュメントとともに引き渡します。",
                    "チームへのオンボーディングと運用移行を支援します。",
                    "必要に応じて、継続改善と保守プランを提供します。",
                ],
            },
        ],
        ctaTitle: "あなたのプロジェクト向けロードマップを作成します",
        ctaLink: "お問い合わせ ->",
    },
    ar: {
        label: "خارطة الطريق",
        title: "خارطة طريق للعميل",
        subtitle:
            "كيف ننفذ خدمات تقنية المعلومات من الاكتشاف وحتى الإطلاق والدعم.",
        back: "العودة للرئيسية",
        sections: [
            {
                title: "الاكتشاف وتحديد النطاق",
                items: [
                    "تحديد الأهداف التجارية والمتطلبات التقنية والجمهور المستهدف.",
                    "تحديد النطاق والجدول الزمني ومراحل التسليم قبل التنفيذ.",
                    "تخطيط التغطية متعددة اللغات: اليابانية والإنجليزية والعربية عند الحاجة.",
                ],
            },
            {
                title: "التنفيذ وضمان الجودة",
                items: [
                    "تنفيذ تطوير البرمجيات والويب والتطبيقات والألعاب على مراحل واضحة.",
                    "إنتاج محتوى الويب والترجمة/التعريب بما يتوافق مع أهداف المشروع.",
                    "إجراء فحوصات الجودة والأداء وجاهزية الإنتاج قبل الإطلاق.",
                ],
            },
            {
                title: "الإطلاق والدعم",
                items: [
                    "النشر والتحقق ثم التسليم مع توثيق واضح.",
                    "دعم انتقال التشغيل وتهيئة فريقك بعد الإطلاق.",
                    "توفير خطط صيانة وتحسين مستمر عند الحاجة.",
                ],
            },
        ],
        ctaTitle: "هل تحتاج خارطة طريق لمشروعك؟",
        ctaLink: "تواصل معنا ->",
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
            title: "Roadmap - NeoWhisper | Client Delivery Process",
            description:
                "Customer-facing roadmap showing how NeoWhisper scopes, builds, and delivers IT services.",
        },
        ja: {
            title: "ロードマップ - NeoWhisper | 提供プロセス",
            description:
                "NeoWhisperがITサービスをどのように要件定義し、開発し、納品するかを示すクライアント向けページ。",
        },
        ar: {
            title: "خارطة الطريق - NeoWhisper | عملية التسليم",
            description:
                "صفحة موجهة للعملاء توضح كيف يقوم NeoWhisper بتحديد النطاق والتنفيذ وتسليم خدمات تقنية المعلومات.",
        },
    };

    const { title, description } = meta[currentLang];

    return {
        title,
        description,
    };
}

export default async function RoadmapPage({
    searchParams,
}: {
    searchParams: Promise<{ lang?: string }>;
}) {
    const { lang } = await searchParams;
    const currentLang = normalizeLang(lang) as SupportedLang;
    const t = translations[currentLang];
    const isRTL = currentLang === "ar";

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 px-4 py-16 sm:px-6 lg:px-8"
            dir={isRTL ? "rtl" : "ltr"}
            lang={currentLang}
        >
            <div className="mx-auto max-w-4xl">
                <div className="mb-16 flex items-center justify-between">
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

                <div className="space-y-12">
                    {t.sections.map((section, idx) => (
                        <div key={section.title} className="relative">
                            {idx !== t.sections.length - 1 && (
                                <div className="absolute left-4 top-8 -bottom-12 w-px bg-purple-500/20 dark:bg-purple-500/10" />
                            )}
                            <div className="flex gap-6">
                                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white shadow-lg shadow-purple-500/20">
                                    {idx + 1}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {section.title}
                                    </h2>
                                    <ul className="mt-6 space-y-4">
                                        {section.items.map((item) => (
                                            <li key={item} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 rounded-3xl border border-white/20 bg-white/60 p-8 text-center backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {t.ctaTitle}
                    </h3>
                    <Link
                        href={`/contact?lang=${currentLang}`}
                        className="mt-4 inline-block text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700"
                    >
                        {t.ctaLink}
                    </Link>
                </div>
            </div>
        </div>
    );
}
