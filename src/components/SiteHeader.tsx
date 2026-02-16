"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { normalizeLang, type SupportedLang, withLang } from "@/lib/i18n";

type NavKey = "services" | "projects" | "roadmap" | "blog" | "about" | "contact";

const navItems = [
  { key: "services", href: "/services" },
  { key: "projects", href: "/projects" },
  { key: "roadmap", href: "/roadmap" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const satisfies ReadonlyArray<{ key: NavKey; href: string }>;

const navLabels: Record<SupportedLang, Record<NavKey, string>> = {
  en: {
    services: "Services",
    projects: "Projects",
    roadmap: "Roadmap",
    blog: "Blog",
    about: "About",
    contact: "Contact",
  },
  ja: {
    services: "サービス",
    projects: "プロジェクト",
    roadmap: "ロードマップ",
    blog: "ブログ",
    about: "概要",
    contact: "お問い合わせ",
  },
  ar: {
    services: "الخدمات",
    projects: "المشاريع",
    roadmap: "خارطة الطريق",
    blog: "المدونة",
    about: "نبذة",
    contact: "تواصل",
  },
};

function detectBlogSlugLang(pathname: string | null): SupportedLang | null {
  if (!pathname?.startsWith("/blog/")) return null;
  if (/-ja\/?$/.test(pathname)) return "ja";
  if (/-ar\/?$/.test(pathname)) return "ar";
  return "en";
}

export default function SiteHeader() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const queryLang = normalizeLang(searchParams?.get("lang")) as SupportedLang;
  const currentLang = detectBlogSlugLang(pathname) ?? queryLang;
  const labels = navLabels[currentLang];

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/70 backdrop-blur-xl dark:bg-black/30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href={withLang("/", currentLang)}
          className="text-sm font-extrabold uppercase tracking-[0.2em] text-gray-900 dark:text-white"
        >
          NeoWhisper
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 text-xs font-semibold uppercase tracking-[0.15em] text-gray-600 dark:text-gray-300 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={withLang(item.href, currentLang)}
              className={`rounded-full border px-3 py-1 transition-all duration-300 hover:-translate-y-0.5 ${isActive(item.href)
                ? "border-purple-500 bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "border-white/20 bg-white/50 hover:bg-white dark:border-white/10 dark:bg-white/5"
                }`}
            >
              {labels[item.key]}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation (Pills) */}
        <div className="flex flex-wrap items-center gap-2 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={withLang(item.href, currentLang)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${isActive(item.href)
                ? "border-purple-600 bg-purple-600 text-white"
                : "border-white/20 bg-white/60 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                }`}
            >
              {labels[item.key]}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
