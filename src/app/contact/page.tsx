import Link from "next/link";
import Script from "next/script";
import ContactForm from "@/components/ContactForm";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

const translations = {
  en: {
    label: "Contact",
    title: "Start a Project",
    subtitle: "Tell us what you're building. We'll respond within 1-2 business days.",
    back: "Back to Home",
    form: {
      name: "Name",
      email: "Email",
      company: "Company (optional)",
      projectType: "Project Type",
      budget: "Budget Range",
      details: "Project Details",
      send: "Send Message",
      sending: "Sending...",
      success: "Thanks! Your message has been received.",
      error: "Something went wrong. Please try again.",
      viewConfirmation: "View confirmation",
      placeholderName: "Your full name",
      placeholderEmail: "you@email.com",
      placeholderCompany: "Company or brand",
      placeholderDetails: "Tell us about your goals, timeline, and any references.",
      emailDirect: "Email Directly",
      options: {
        projectType: [
          "Web product",
          "Game development",
          "Localization / translation",
          "Content strategy",
          "Other",
        ],
        budget: ["Under $1k", "$1k - $5k", "$5k - $15k", "$15k+", "Not sure"],
      },
    },
  },
  ja: {
    label: "お問い合わせ",
    title: "プロジェクトの相談",
    subtitle: "内容をお聞かせください。1〜2営業日以内にご返信します。",
    back: "ホームへ戻る",
    form: {
      name: "お名前",
      email: "メールアドレス",
      company: "会社名（任意）",
      projectType: "プロジェクト種別",
      budget: "ご予算",
      details: "ご相談内容",
      send: "送信する",
      sending: "送信中...",
      success: "送信ありがとうございます。内容を確認します。",
      error: "送信に失敗しました。時間をおいて再度お試しください。",
      viewConfirmation: "送信内容を確認",
      placeholderName: "お名前",
      placeholderEmail: "you@email.com",
      placeholderCompany: "会社名またはブランド名",
      placeholderDetails: "目的・納期・参考URLなどをご記入ください。",
      emailDirect: "直接メールする",
      options: {
        projectType: [
          "Webプロダクト",
          "ゲーム開発",
          "翻訳・ローカライズ",
          "コンテンツ戦略",
          "その他",
        ],
        budget: ["〜10万円", "10〜50万円", "50〜150万円", "150万円以上", "未定"],
      },
    },
  },
  ar: {
    label: "تواصل",
    title: "ابدأ مشروعك",
    subtitle: "شاركنا فكرتك وسنعود إليك خلال يوم إلى يومين عمل.",
    back: "العودة للرئيسية",
    form: {
      name: "الاسم",
      email: "البريد الإلكتروني",
      company: "الشركة (اختياري)",
      projectType: "نوع المشروع",
      budget: "الميزانية المتوقعة",
      details: "تفاصيل المشروع",
      send: "إرسال",
      sending: "جاري الإرسال...",
      success: "تم استلام رسالتك بنجاح.",
      error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
      viewConfirmation: "عرض التأكيد",
      placeholderName: "اسمك الكامل",
      placeholderEmail: "you@email.com",
      placeholderCompany: "اسم الشركة أو العلامة",
      placeholderDetails: "صف الأهداف والمدة الزمنية وأي مراجع.",
      emailDirect: "إرسال بريد مباشر",
      options: {
        projectType: [
          "منتج ويب",
          "تطوير ألعاب",
          "ترجمة وتعريب",
          "استراتيجية محتوى",
          "أخرى",
        ],
        budget: ["أقل من 3,000 ر.س", "3,000 - 15,000 ر.س", "15,000 - 60,000 ر.س", "أكثر من 60,000 ر.س", "غير محدد"],
      },
    },
  },
} as const;

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const t = translations[currentLang];
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 px-4 py-16 sm:px-6 lg:px-8" dir={currentLang === "ar" ? "rtl" : "ltr"} lang={currentLang}>
      <div className="mx-auto max-w-5xl">
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

        <div className="rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
          {turnstileSiteKey && (
            <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js"
              async
              defer
            />
          )}
          <ContactForm
            copy={t.form}
            lang={currentLang}
            turnstileSiteKey={turnstileSiteKey}
          />
        </div>
      </div>
    </div>
  );
}
