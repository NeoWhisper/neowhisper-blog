import Link from "next/link";
import { Metadata } from "next";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

const translations = {
    en: {
        label: "Roadmap",
        title: "Mission & Vision",
        subtitle: "The path from shipped products to global impact.",
        back: "Back to Home",
        sections: [
            {
                title: "Delivered & Shipped",
                items: [
                    "NeoWhisper Blog Platform (Next.js/MDX Stack)",
                    "Studio Portfolio & Service Catalog",
                ],
            },
            {
                title: "In Progress (2026)",
                items: [
                    "Indie Game MVP & Vertical Slice",
                    "Open Source Automation Tools (TypeScript/Python)",
                    "Client Case Studies & B2B Solutions",
                ],
            },
            {
                title: "Long-Term (2027+)",
                items: [
                    "Bridges: Connecting Japan and Middle East via multilingual tech.",
                    "Digital Physicality: Merging creative media with software.",
                    "Localization Ecosystems for JP/EN/AR markets.",
                ],
            },
        ],
        technicalTitle: "Technical Roadmap for Developers",
        technicalLink: "View on GitHub →",
    },
    ja: {
        label: "ロードマップ",
        title: "ミッションとビジョン",
        subtitle: "出荷済みの製品から、グローバルなインパクトへの道筋。",
        back: "ホームへ戻る",
        sections: [
            {
                title: "提供済み・ローンチ済み",
                items: [
                    "NeoWhisper ブログプラットフォーム (Next.js/MDX構成)",
                    "スタジオポートフォリオ・提供サービス一覧",
                ],
            },
            {
                title: "進行中 (2026)",
                items: [
                    "インディーゲームMVP・垂直スライス版",
                    "オープンソース自動化ツール (TypeScript/Python)",
                    "クライアント事例・B2Bソリューション開発",
                ],
            },
            {
                title: "長期ビジョン (2027年以降)",
                items: [
                    "Bridges: 多言語技術で日本と中東を繋ぐ架け橋へ",
                    "デジタルフィジカリティ: クリエイティブメディアとソフトの融合",
                    "日・英・阿市場向けのローカライズ・エコシステム構築",
                ],
            },
        ],
        technicalTitle: "開発者向けテクニカルロードマップ",
        technicalLink: "GitHubで見る →",
    },
    ar: {
        label: "خارطة الطريق",
        title: "المهمة والرؤية",
        subtitle: "المسار من المنتجات المنفذة إلى الأثر العالمي.",
        back: "العودة للرئيسية",
        sections: [
            {
                title: "تم التسليم والإطلاق",
                items: [
                    "منصة مدونة NeoWhisper (Next.js/MDX)",
                    "معرض أعمال الاستوديو وقائمة الخدمات",
                ],
            },
            {
                title: "قيد التنفيذ (2026)",
                items: [
                    "نموذج أولي للعبة مستقلة (MVP)",
                    "أدوات أتمتة مفتوحة المصدر (TypeScript/Python)",
                    "دراسات حالة للعملاء وحلول B2B",
                ],
            },
            {
                title: "بعيد المدى (2027 وما بعده)",
                items: [
                    "الجسور: ربط اليابان والشرق الأوسط عبر التقنيات متعددة اللغات",
                    "الواقع الرقمي: دمج الوسائط الإبداعية مع البرمجيات",
                    "نظام بيئي للتعريب لأسواق اليابان والشرق الأوسط",
                ],
            },
        ],
        technicalTitle: "خارطة الطريق التقنية للمطورين",
        technicalLink: "عرض على GitHub →",
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
            title: "Roadmap - NeoWhisper | Future Vision & Shipped Work",
            description: "Discover the professional and technical roadmap of NeoWhisper. From multilingual platforms to Japanese-Middle Eastern tech bridges.",
        },
        ja: {
            title: "ロードマップ - NeoWhisper | 今後のビジョンと実績",
            description: "NeoWhisperのビジネス・技術ロードマップ。多言語プラットフォームから日本と中東の技術の架け橋まで。",
        },
        ar: {
            title: "خارطة الطريق - NeoWhisper | الرؤية المستقبلية والأعمال المنفذة",
            description: "اكتشف خارطة الطريق المهنية والتقنية لنيو ويسبر. من المنصات متعددة اللغات إلى جسور التقنية بين اليابان والشرق الأوسط.",
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
                        {t.technicalTitle}
                    </h3>
                    <a
                        href="https://github.com/NeoWhisper"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700"
                    >
                        {t.technicalLink}
                    </a>
                </div>
            </div>
        </div>
    );
}
