import Link from "next/link";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

const translations = {
  en: {
    title: "Message sent",
    subtitle: "Thanks for reaching out. We'll reply soon.",
    back: "Back to Home",
    contact: "Send another message",
  },
  ja: {
    title: "送信完了",
    subtitle: "お問い合わせありがとうございます。近日中にご返信します。",
    back: "ホームへ戻る",
    contact: "もう一度送信",
  },
  ar: {
    title: "تم الإرسال",
    subtitle: "شكرًا لتواصلك معنا. سنرد عليك قريبًا.",
    back: "العودة للرئيسية",
    contact: "إرسال رسالة أخرى",
  },
} as const;

export default async function ContactSuccessPage({
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
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-500">
          Contact
        </p>
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white">
          {t.title}
        </h1>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          {t.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/?lang=${currentLang}`}
            className="rounded-full border border-white/20 bg-white/70 px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
          >
            {t.back}
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
  );
}
