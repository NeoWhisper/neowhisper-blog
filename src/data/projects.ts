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
        "A multilingual, SEO-first publishing stack built on Next.js App Router and MDX.",
      tags: ["Next.js", "MDX", "SEO"],
      status: "live",
      image: "/images/nextjs-16-blog-tutorial.png",
      links: [
        { label: "Case Study", href: "/blog" },
        { label: "Live Site", href: "https://www.neowhisper.net" },
      ],
    },
    {
      title: "Client Dashboards",
      description:
        "Operational analytics and workflow systems tailored to internal teams.",
      tags: ["TypeScript", "Data", "Product"],
      status: "planned",
      image: "/images/desert-washi-hero.png",
      links: [{ label: "Coming Soon" }],
    },
    {
      title: "Indie Game Prototypes",
      description:
        "Playable experiments with polished UX and rapid iteration cycles.",
      tags: ["Game Dev", "Unity", "Godot"],
      status: "planned",
      image: "/images/nextjs-16-tutorial-cover.png",
      links: [{ label: "Coming Soon" }],
    },
    {
      title: "Localization Kits",
      description: "End-to-end localization for EN/JA/AR product launches.",
      tags: ["i18n", "Translation", "QA"],
      status: "planned",
      image: "/images/typescript-best-practices-cover.png",
      links: [{ label: "Coming Soon" }],
    },
  ],
  ja: [
    {
      title: "NeoWhisper ブログプラットフォーム",
      description:
        "Next.js App Router と MDX を使った多言語・SEO重視の出版基盤。",
      tags: ["Next.js", "MDX", "SEO"],
      status: "live",
      image: "/images/nextjs-16-blog-tutorial.png",
      links: [
        { label: "事例を見る", href: "/blog" },
        { label: "ライブサイト", href: "https://www.neowhisper.net" },
      ],
    },
    {
      title: "クライアントダッシュボード",
      description:
        "チーム運用と意思決定を支える分析・業務支援ツール。",
      tags: ["TypeScript", "Data", "Product"],
      status: "planned",
      image: "/images/desert-washi-hero.png",
      links: [{ label: "準備中" }],
    },
    {
      title: "インディーゲーム試作",
      description: "プロトタイプから高品質な体験を検証する制作枠。",
      tags: ["Game Dev", "Unity", "Godot"],
      status: "planned",
      image: "/images/nextjs-16-tutorial-cover.png",
      links: [{ label: "準備中" }],
    },
    {
      title: "ローカライズキット",
      description: "EN/JA/ARローンチを支える翻訳・監修パイプライン。",
      tags: ["i18n", "Translation", "QA"],
      status: "planned",
      image: "/images/typescript-best-practices-cover.png",
      links: [{ label: "準備中" }],
    },
  ],
  ar: [
    {
      title: "منصة مدونة NeoWhisper",
      description:
        "منصة نشر متعددة اللغات محسّنة للسيو مبنية على Next.js وMDX.",
      tags: ["Next.js", "MDX", "SEO"],
      status: "live",
      image: "/images/nextjs-16-blog-tutorial.png",
      links: [
        { label: "دراسة حالة", href: "/blog" },
        { label: "الموقع", href: "https://www.neowhisper.net" },
      ],
    },
    {
      title: "لوحات تحكم العملاء",
      description:
        "أنظمة تشغيل وتحليلات مخصّصة لدعم الفرق والقرارات اليومية.",
      tags: ["TypeScript", "Data", "Product"],
      status: "planned",
      image: "/images/desert-washi-hero.png",
      links: [{ label: "قريبًا" }],
    },
    {
      title: "نماذج ألعاب مستقلة",
      description:
        "نماذج أولية سريعة لتجارب لعب مصقولة وقابلة للإطلاق.",
      tags: ["Game Dev", "Unity", "Godot"],
      status: "planned",
      image: "/images/nextjs-16-tutorial-cover.png",
      links: [{ label: "قريبًا" }],
    },
    {
      title: "حزم التعريب",
      description:
        "سير عمل ترجمة وتعريب احترافي لأسواق EN/JA/AR.",
      tags: ["i18n", "Translation", "QA"],
      status: "planned",
      image: "/images/typescript-best-practices-cover.png",
      links: [{ label: "قريبًا" }],
    },
  ],
};

export function getProjects(lang: SupportedLang): ProjectCard[] {
  return projectsByLang[lang];
}
