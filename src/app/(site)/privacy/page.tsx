import type { Metadata } from "next";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

const LAST_UPDATED = "2026-02-16";

const copyByLang: Record<
  SupportedLang,
  {
    title: string;
    description: string;
    updated: string;
    points: string[];
  }
> = {
  en: {
    title: "Privacy Policy",
    description:
      "How NeoWhisper collects, uses, and protects visitor and client data.",
    updated: `Last updated: ${LAST_UPDATED}`,
    points: [
      "NeoWhisper collects only the information necessary to operate this site, respond to inquiries, and deliver requested IT services. We do not sell personal data.",
      "Contact form data (name, email, company, project details) is used only for project communication and service delivery. Data is sent over HTTPS and processed by service providers used for email and spam prevention.",
      "Analytics and advertising tools (such as Google Analytics and Google AdSense, when enabled) may use cookies for measurement and ad delivery. You can control cookies through browser settings.",
      "If you need data access, correction, or deletion, contact neowhisperhq@gmail.com.",
    ],
  },
  ja: {
    title: "プライバシーポリシー",
    description: "NeoWhisperにおける個人情報の取得・利用・保護方針について。",
    updated: `最終更新日: ${LAST_UPDATED}`,
    points: [
      "NeoWhisperは、サイト運営・お問い合わせ対応・ITサービス提供に必要な範囲でのみ情報を取得します。個人データを販売することはありません。",
      "お問い合わせフォームで送信された情報（氏名・メール・会社名・相談内容）は、案件対応および連絡目的でのみ利用します。送信はHTTPSで保護され、メール配信やスパム対策に利用する外部サービスで処理されます。",
      "Google AnalyticsやGoogle AdSense（有効時）などの計測・広告ツールがCookieを利用する場合があります。Cookieはブラウザ設定で管理できます。",
      "開示・訂正・削除のご依頼は、neowhisperhq@gmail.com までご連絡ください。",
    ],
  },
  ar: {
    title: "سياسة الخصوصية",
    description: "كيفية جمع NeoWhisper لبيانات الزوار والعملاء واستخدامها وحمايتها.",
    updated: `آخر تحديث: ${LAST_UPDATED}`,
    points: [
      "يجمع NeoWhisper فقط البيانات اللازمة لتشغيل الموقع، والرد على الاستفسارات، وتقديم خدمات تقنية المعلومات المطلوبة. لا نقوم ببيع البيانات الشخصية.",
      "بيانات نموذج التواصل (الاسم، البريد، الشركة، تفاصيل المشروع) تُستخدم فقط للتواصل وتنفيذ الخدمة. يتم الإرسال عبر HTTPS وتُعالج البيانات لدى مزودي خدمة البريد والحماية من الرسائل المزعجة.",
      "قد تستخدم أدوات التحليلات والإعلانات مثل Google Analytics وGoogle AdSense (عند التفعيل) ملفات تعريف الارتباط لأغراض القياس وعرض الإعلانات. يمكنك إدارة الكوكيز من إعدادات المتصفح.",
      "لطلب الوصول إلى بياناتك أو تعديلها أو حذفها، راسلنا على neowhisperhq@gmail.com.",
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
  const copy = copyByLang[currentLang];

  return {
    title: `${copy.title} | NeoWhisper`,
    description: copy.description,
    alternates: {
      languages: {
        en: "/privacy?lang=en",
        ja: "/privacy?lang=ja",
        ar: "/privacy?lang=ar",
      },
    },
  };
}

export default async function PrivacyPage({
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {copy.title}
      </h1>
      <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">
        {copy.updated}
      </p>

      <section className="mt-8 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
        <ul className="space-y-3">
          {copy.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
