import type { SupportedLang } from "@/lib/i18n";

export type ProjectStatus = "live" | "planned";

export interface ProjectLink {
  label: string;
  href?: string;
}

export interface ProjectCard {
  title: string;
  description: string;
  tags: string[];
  status: ProjectStatus;
  image: string;
  links: ProjectLink[];
}

const projectsByLang: Record<SupportedLang, ProjectCard[]> = {
  en: [
    {
      title: "NeoWhisper Blog Platform",
      description:
        "Multilingual blog platform (JP/EN/AR) built with Next.js and MDX; optimized for SEO and content publishing.",
      tags: ["Next.js", "MDX", "Tailwind", "i18n", "SEO"],
      status: "live",
      image: "/images/nextjs-16-blog-tutorial.png",
      links: [
        { label: "View Live Site", href: "https://www.neowhisper.net" },
        { label: "View Code", href: "https://github.com/NeoWhisper/neowhisper-blog" },
      ],
    },
    {
      title: "Production Contact Pipeline",
      description:
        "End-to-end inquiry flow with anti-spam protection, transactional email delivery, and operational safety checks.",
      tags: ["Turnstile", "Resend", "Supabase", "Next.js API"],
      status: "live",
      image: "/images/contact-form-cover.png",
      links: [
        { label: "View Contact Page", href: "/contact" },
        { label: "Read Implementation", href: "/blog/production-contact-forms-turnstile-resend" },
      ],
    },
    {
      title: "Security Hardening Rollout",
      description:
        "Nonce-based CSP, targeted CORS controls, and iterative policy tuning for AdSense + analytics compatibility on Vercel.",
      tags: ["CSP", "CORS", "Vercel", "Security"],
      status: "live",
      image: "/images/csp-debugging-cover.png",
      links: [
        { label: "Read CSP Case Study", href: "/blog/debugging-csp-errors-adsense" },
        { label: "View Editorial Policy", href: "/editorial-policy" },
      ],
    },
  ],
  ja: [
    {
      title: "NeoWhisper ブログプラットフォーム",
      description:
        "Next.jsとMDXで構築された多言語ブログ（日本語/英語/アラビア語）。SEOとコンテンツ配信に最適化されています。",
      tags: ["Next.js", "MDX", "Tailwind", "i18n", "SEO"],
      status: "live",
      image: "/images/nextjs-16-blog-tutorial.png",
      links: [
        { label: "ライブサイトを見る", href: "https://www.neowhisper.net" },
        { label: "コードを見る", href: "https://github.com/NeoWhisper/neowhisper-blog" },
      ],
    },
    {
      title: "本番向けお問い合わせ基盤",
      description:
        "スパム対策、メール送信、運用上の安全性を組み込んだ、実運用対応のお問い合わせ導線。",
      tags: ["Turnstile", "Resend", "Supabase", "Next.js API"],
      status: "live",
      image: "/images/contact-form-cover.png",
      links: [
        { label: "お問い合わせページ", href: "/contact" },
        { label: "実装記事を読む", href: "/blog/production-contact-forms-turnstile-resend-ja" },
      ],
    },
    {
      title: "セキュリティ強化ロールアウト",
      description:
        "Vercel環境で、AdSense/分析基盤との互換性を維持しつつ、nonceベースCSPとCORS制御を段階的に導入。",
      tags: ["CSP", "CORS", "Vercel", "Security"],
      status: "live",
      image: "/images/csp-debugging-cover.png",
      links: [
        { label: "CSPケーススタディ", href: "/blog/debugging-csp-errors-adsense-ja" },
        { label: "編集ポリシーを見る", href: "/editorial-policy" },
      ],
    },
  ],
  ar: [
    {
      title: "منصة مدونة NeoWhisper",
      description:
        "منصة تدوين متعددة اللغات (اليابانية/الإنجليزية/العربية) مبنية بـ Next.js وMDX؛ محسنة لمحركات البحث والنشر.",
      tags: ["Next.js", "MDX", "Tailwind", "i18n", "SEO"],
      status: "live",
      image: "/images/nextjs-16-blog-tutorial.png",
      links: [
        { label: "عرض الموقع", href: "https://www.neowhisper.net" },
        { label: "عرض الكود", href: "https://github.com/NeoWhisper/neowhisper-blog" },
      ],
    },
    {
      title: "مسار تواصل جاهز للإنتاج",
      description:
        "مسار متكامل لطلبات العملاء مع حماية من الرسائل المزعجة، إرسال بريد موثوق، وضوابط تشغيلية واضحة.",
      tags: ["Turnstile", "Resend", "Supabase", "Next.js API"],
      status: "live",
      image: "/images/contact-form-cover.png",
      links: [
        { label: "صفحة التواصل", href: "/contact" },
        { label: "قراءة التنفيذ", href: "/blog/production-contact-forms-turnstile-resend-ar" },
      ],
    },
    {
      title: "تنفيذ تقوية الأمان",
      description:
        "تطبيق CSP بالـ nonce وضبط CORS بشكل دقيق مع الحفاظ على توافق AdSense والتحليلات على Vercel.",
      tags: ["CSP", "CORS", "Vercel", "Security"],
      status: "live",
      image: "/images/csp-debugging-cover.png",
      links: [
        { label: "دراسة حالة CSP", href: "/blog/debugging-csp-errors-adsense-ar" },
        { label: "سياسة التحرير", href: "/editorial-policy" },
      ],
    },
  ],
};

export function getProjects(lang: SupportedLang): ProjectCard[] {
  return projectsByLang[lang];
}
