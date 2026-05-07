import type { SupportedLang } from "@/lib/i18n";

export type ContentState = "now" | "in_progress" | "planned";

export interface ProjectLink {
  label: string;
  href?: string;
}

export interface ProjectProof {
  challenge: string;
  scope: string;
  stack: string;
  outcome: string;
}

export interface ProjectCard {
  title: string;
  description: string;
  tags: string[];
  status: ContentState;
  image: string;
  links: ProjectLink[];
  proof?: ProjectProof;
}

const projectsByLang: Record<SupportedLang, ProjectCard[]> = {
  en: [
    {
      title: "NeoWhisper Blog Platform",
      description:
        "Multilingual blog platform (JP/EN/AR) built with Next.js and MDX; optimized for SEO and content publishing.",
      tags: ["Next.js", "MDX", "Tailwind", "i18n", "SEO"],
      status: "now",
      image: "/images/nextjs-16-blog-tutorial.png",
      links: [
        { label: "View Live Site", href: "https://www.neowhisper.net" },
        { label: "View Code", href: "https://github.com/NeoWhisper/neowhisper-blog" },
      ],
      proof: {
        challenge: "Operate one codebase across JP/EN/AR content and routing.",
        scope: "Implemented App Router i18n, metadata, and publishing workflow.",
        stack: "Next.js, TypeScript, MDX, Tailwind, Supabase.",
        outcome: "Shipped multilingual publishing in production with a maintainable workflow.",
      },
    },
    {
      title: "Production Contact Pipeline",
      description:
        "End-to-end inquiry flow with anti-spam protection, transactional email delivery, and operational safety checks.",
      tags: ["Turnstile", "Resend", "Supabase", "Next.js API"],
      status: "now",
      image: "/images/contact-form-cover.png",
      links: [
        { label: "View Contact Page", href: "/contact" },
        { label: "Read Implementation", href: "/blog/production-contact-forms-turnstile-resend" },
      ],
      proof: {
        challenge: "Filter spam while keeping inquiry submission simple.",
        scope: "Built contact endpoint, validation, anti-bot checks, and mail flow.",
        stack: "Next.js API routes, Turnstile, Resend, Supabase.",
        outcome: "Deployed a stable inquiry pipeline suitable for real client intake.",
      },
    },
    {
      title: "Security Hardening Rollout",
      description:
        "Nonce-based CSP, targeted CORS controls, and iterative policy tuning for AdSense + analytics compatibility on Vercel.",
      tags: ["CSP", "CORS", "Vercel", "Security"],
      status: "now",
      image: "/images/csp-debugging-cover.png",
      links: [
        { label: "Read CSP Case Study", href: "/blog/debugging-csp-errors-adsense" },
        { label: "View Editorial Policy", href: "/editorial-policy" },
      ],
      proof: {
        challenge: "Allow required third-party scripts without weakening baseline security.",
        scope: "Implemented nonce-based CSP and iterative allowlist controls.",
        stack: "Next.js middleware/proxy, Vercel, security headers.",
        outcome: "Hardened policy configuration now used by the production site.",
      },
    },
    {
      title: "Client Dashboards (Roadmap)",
      description:
        "Operational dashboard templates for internal analytics and workflow tracking.",
      tags: ["Roadmap", "Dashboard", "Internal Tools"],
      status: "in_progress",
      image: "/images/nextjs-16-blog-tutorial.png",
      links: [{ label: "Roadmap Item" }],
    },
    {
      title: "Localization Kits (Planned)",
      description:
        "Reusable localization workflow assets for EN/JA/AR launch support.",
      tags: ["Planned", "Localization", "Workflow"],
      status: "planned",
      image: "/images/nextjs-16-blog-tutorial.png",
      links: [{ label: "Planned" }],
    },
  ],
  ja: [
    {
      title: "NeoWhisper ブログプラットフォーム",
      description:
        "Next.jsとMDXで構築された多言語ブログ（日本語/英語/アラビア語）。SEOとコンテンツ配信に最適化されています。",
      tags: ["Next.js", "MDX", "Tailwind", "i18n", "SEO"],
      status: "now",
      image: "/images/nextjs-16-blog-tutorial.png",
      links: [
        { label: "ライブサイトを見る", href: "https://www.neowhisper.net" },
        { label: "コードを見る", href: "https://github.com/NeoWhisper/neowhisper-blog" },
      ],
      proof: {
        challenge: "1つのコードベースで日英アラビア語運用を実現すること。",
        scope: "App Router多言語設計・メタデータ・配信フローを実装。",
        stack: "Next.js、TypeScript、MDX、Tailwind、Supabase。",
        outcome: "多言語運用を本番で回せる公開基盤を構築。",
      },
    },
    {
      title: "本番向けお問い合わせ基盤",
      description:
        "スパム対策、メール送信、運用上の安全性を組み込んだ、実運用対応のお問い合わせ導線。",
      tags: ["Turnstile", "Resend", "Supabase", "Next.js API"],
      status: "now",
      image: "/images/contact-form-cover.png",
      links: [
        { label: "お問い合わせページ", href: "/contact" },
        { label: "実装記事を読む", href: "/blog/production-contact-forms-turnstile-resend-ja" },
      ],
      proof: {
        challenge: "スパムを抑えつつ離脱を増やさない導線設計。",
        scope: "入力検証・Bot対策・通知送信までを一体実装。",
        stack: "Next.js API、Turnstile、Resend、Supabase。",
        outcome: "案件相談に使える問い合わせ導線を本番運用。",
      },
    },
    {
      title: "セキュリティ強化ロールアウト",
      description:
        "Vercel環境で、AdSense/分析基盤との互換性を維持しつつ、nonceベースCSPとCORS制御を段階的に導入。",
      tags: ["CSP", "CORS", "Vercel", "Security"],
      status: "now",
      image: "/images/csp-debugging-cover.png",
      links: [
        { label: "CSPケーススタディ", href: "/blog/debugging-csp-errors-adsense-ja" },
        { label: "編集ポリシーを見る", href: "/editorial-policy" },
      ],
      proof: {
        challenge: "必要な外部連携を許可しつつセキュリティ基準を維持すること。",
        scope: "nonceベースCSPと許可ドメインを段階調整。",
        stack: "Next.js middleware/proxy、Vercel、セキュリティヘッダー。",
        outcome: "本番サイトで運用可能な強化ポリシーへ移行。",
      },
    },
    {
      title: "クライアントダッシュボード（進行中）",
      description:
        "運用分析やタスク可視化を目的とした社内向けダッシュボード構成を検証中。",
      tags: ["進行中", "ダッシュボード", "業務ツール"],
      status: "in_progress",
      image: "/images/nextjs-16-blog-tutorial.png",
      links: [{ label: "ロードマップ項目" }],
    },
    {
      title: "ローカライズキット（計画）",
      description:
        "EN/JA/AR展開向けの翻訳運用テンプレートを整備予定。",
      tags: ["計画", "ローカライズ", "ワークフロー"],
      status: "planned",
      image: "/images/nextjs-16-blog-tutorial.png",
      links: [{ label: "計画中" }],
    },
  ],
  ar: [
    {
      title: "منصة مدونة NeoWhisper",
      description:
        "منصة تدوين متعددة اللغات (اليابانية/الإنجليزية/العربية) مبنية بـ Next.js وMDX؛ محسنة لمحركات البحث والنشر.",
      tags: ["Next.js", "MDX", "Tailwind", "i18n", "SEO"],
      status: "now",
      image: "/images/nextjs-16-blog-tutorial.png",
      links: [
        { label: "عرض الموقع", href: "https://www.neowhisper.net" },
        { label: "عرض الكود", href: "https://github.com/NeoWhisper/neowhisper-blog" },
      ],
      proof: {
        challenge: "تشغيل موقع واحد بثلاث لغات بشكل ثابت.",
        scope: "تنفيذ بنية تعدد اللغات والميتا ومسار النشر.",
        stack: "Next.js وTypeScript وMDX وTailwind وSupabase.",
        outcome: "إطلاق منصة نشر متعددة اللغات تعمل في الإنتاج.",
      },
    },
    {
      title: "مسار تواصل جاهز للإنتاج",
      description:
        "مسار متكامل لطلبات العملاء مع حماية من الرسائل المزعجة، إرسال بريد موثوق، وضوابط تشغيلية واضحة.",
      tags: ["Turnstile", "Resend", "Supabase", "Next.js API"],
      status: "now",
      image: "/images/contact-form-cover.png",
      links: [
        { label: "صفحة التواصل", href: "/contact" },
        { label: "قراءة التنفيذ", href: "/blog/production-contact-forms-turnstile-resend-ar" },
      ],
      proof: {
        challenge: "تقليل الرسائل المزعجة بدون تعقيد تجربة التواصل.",
        scope: "تنفيذ التحقق والحماية من البوتات ومسار الإشعارات.",
        stack: "Next.js API وTurnstile وResend وSupabase.",
        outcome: "تشغيل مسار تواصل موثوق مناسب لاستقبال طلبات العملاء.",
      },
    },
    {
      title: "تنفيذ تقوية الأمان",
      description:
        "تطبيق CSP بالـ nonce وضبط CORS بشكل دقيق مع الحفاظ على توافق AdSense والتحليلات على Vercel.",
      tags: ["CSP", "CORS", "Vercel", "Security"],
      status: "now",
      image: "/images/csp-debugging-cover.png",
      links: [
        { label: "دراسة حالة CSP", href: "/blog/debugging-csp-errors-adsense-ar" },
        { label: "سياسة التحرير", href: "/editorial-policy" },
      ],
      proof: {
        challenge: "السماح بالتكاملات الضرورية مع الحفاظ على سياسة أمان صارمة.",
        scope: "تطبيق CSP بالـ nonce وضبط قوائم السماح تدريجياً.",
        stack: "Next.js middleware/proxy وVercel وترويسات الأمان.",
        outcome: "نشر إعدادات أمان محسنة قابلة للتشغيل في البيئة الحية.",
      },
    },
    {
      title: "لوحات تحكم العملاء (قيد التنفيذ)",
      description:
        "العمل على قوالب لوحات تشغيلية لمتابعة المهام والتحليلات الداخلية.",
      tags: ["قيد التنفيذ", "لوحات تحكم", "أدوات داخلية"],
      status: "in_progress",
      image: "/images/nextjs-16-blog-tutorial.png",
      links: [{ label: "عنصر خارطة الطريق" }],
    },
    {
      title: "حزم التعريب (مخطط)",
      description:
        "إعداد أصول سير عمل قابلة لإعادة الاستخدام للإطلاقات EN/JA/AR.",
      tags: ["مخطط", "تعريب", "سير عمل"],
      status: "planned",
      image: "/images/nextjs-16-blog-tutorial.png",
      links: [{ label: "مخطط" }],
    },
  ],
};

export function getProjects(lang: SupportedLang): ProjectCard[] {
  return projectsByLang[lang];
}
