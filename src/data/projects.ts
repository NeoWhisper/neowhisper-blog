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
  ],
};

export function getProjects(lang: SupportedLang): ProjectCard[] {
  return projectsByLang[lang];
}
