import type { Metadata } from "next";
import type { ReactNode } from "react";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site-config";

const LAST_UPDATED = "2026-04-16";
const baseUrl = SITE_URL;

const copyByLang: Record<
  SupportedLang,
  {
    title: string;
    description: string;
    updated: string;
    points: ReactNode[];
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
      <>This site uses <strong>Google AdSense</strong> to display advertisements. Google AdSense uses cookies and web beacons to serve ads based on your prior visits to this and other websites. You can learn more about how Google uses your data at:{" "}<a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline">policies.google.com/technologies/partner-sites</a>.</>,
      "Google's use of advertising cookies enables Google and its partners to serve personalised ads based on your visit to this site and/or other sites on the Internet.",
      <>You may opt out of personalised advertising by visiting{" "}<a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline">Google Ads Settings</a>. You can also manage or disable cookies via your browser settings.</>,
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
      <>当サイトは<strong>Google AdSense</strong>を利用して広告を表示しています。Google AdSenseはCookieおよびウェブビーコンを使用し、ユーザーの過去のアクセス情報に基づいて広告を配信します。Googleによるデータ利用の詳細は{" "}<a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline">こちら</a>をご覧ください。</>,
      "Googleの広告Cookieにより、Googleおよびそのパートナーは、ユーザーの本サイトまたはインターネット上の他サイトへのアクセス情報に基づいたパーソナライズ広告を表示できます。",
      <>パーソナライズ広告は{" "}<a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline">Google 広告設定</a>から無効化できます。Cookieはブラウザ設定からも管理できます。</>,
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
      <>يستخدم هذا الموقع <strong>Google AdSense</strong> لعرض الإعلانات. يستخدم Google AdSense ملفات تعريف الارتباط والإشارات الإلكترونية لتقديم إعلانات بناءً على زياراتك السابقة لهذا الموقع ومواقع أخرى. يمكنك الاطلاع على كيفية استخدام Google لبياناتك من خلال:{" "}<a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline">policies.google.com/technologies/partner-sites</a>.</>,
      "يسمح استخدام Google لملفات تعريف ارتباط الإعلانات لـ Google وشركائها بعرض إعلانات مخصصة وفقًا لزيارة المستخدم لهذا الموقع و/أو لمواقع أخرى على الإنترنت.",
      <>يمكنك إيقاف الإعلانات المُخصَّصة عبر{" "}<a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline">إعدادات إعلانات Google</a>. كما يمكن إدارة ملفات تعريف الارتباط من إعدادات المتصفح.</>,
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
  const canonicalPath = currentLang === "en" ? "/privacy" : `/privacy?lang=${currentLang}`;

  return {
    title: `${copy.title} | NeoWhisper`,
    description: copy.description,
    openGraph: {
      title: `${copy.title} | NeoWhisper`,
      description: copy.description,
      type: "website",
      url: `${baseUrl}${canonicalPath}`,
    },
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: "/privacy",
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
          {copy.points.map((point, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={i}>{point}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
