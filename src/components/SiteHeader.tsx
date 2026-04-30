"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { normalizeLang, type SupportedLang, withLang } from "@/lib/i18n";
import ThemeToggle from "./ThemeToggle";

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
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get language from URL param - only use detected lang after mount to avoid hydration mismatch
  const queryLang = normalizeLang(searchParams?.get("lang")) as SupportedLang;
  const detectedLang = detectBlogSlugLang(pathname) ?? queryLang;
  // Use "en" during SSR, switch to detected lang only after mount
  const currentLang = mounted ? detectedLang : "en";

  // Compute base path for language switching - preserves current page but removes lang param
  const basePath = pathname || "/";
  const searchWithoutLang = (() => {
    if (!searchParams) return "";
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lang");
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  })();
  const currentPathWithoutLang = `${basePath}${searchWithoutLang}`;
  const labels = navLabels[currentLang];

  // Don't render language switcher until mounted to avoid hydration mismatch
  const showLangSwitcher = mounted;

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

        <div className="flex items-center gap-3">
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-3 text-xs font-semibold uppercase tracking-[0.15em] text-gray-600 dark:text-gray-300 md:flex">
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

          {/* Language Switcher - Client only to avoid hydration mismatch */}
          {showLangSwitcher && (
            <nav aria-label="Language" className="flex items-center gap-1" data-testid="language-switcher">
              <Link
                href={currentPathWithoutLang || "/"}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${currentLang === "en" ? "text-purple-600 dark:text-purple-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                hrefLang="en"
              >
                EN
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Link
                href={`${currentPathWithoutLang || "/"}?lang=ja`}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${currentLang === "ja" ? "text-purple-600 dark:text-purple-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                hrefLang="ja"
              >
                JA
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Link
                href={`${currentPathWithoutLang || "/"}?lang=ar`}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${currentLang === "ar" ? "text-purple-600 dark:text-purple-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                hrefLang="ar"
              >
                AR
              </Link>
            </nav>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile Navigation Toggle (simplified) */}
          <div className="flex items-center gap-2 md:hidden">
            {navItems.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={withLang(item.href, currentLang)}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${isActive(item.href)
                  ? "border-purple-600 bg-purple-600 text-white"
                  : "border-white/20 bg-white/60 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                  }`}
              >
                {labels[item.key]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
