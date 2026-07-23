"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { normalizeLang, type SupportedLang, withLang } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import ThemeToggle from "./ThemeToggle";
import { Menu, X } from "lucide-react";

type NavKey = "services" | "projects" | "roadmap" | "blog" | "about" | "contact";

const navItems = [
  { key: "services", href: "/services" },
  { key: "projects", href: "/projects" },
  { key: "roadmap", href: "/roadmap" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const satisfies ReadonlyArray<{ key: NavKey; href: string }>;


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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Intentional: setState for hydration safety (runs once on mount)
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const t = getDictionary(currentLang);

  // Don't render language switcher until mounted to avoid hydration mismatch
  const showLangSwitcher = mounted;

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-lg shadow-purple-500/5">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent blur-[1px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8 relative z-10">
        <Link
          href={withLang("/", currentLang)}
          className="text-sm font-extrabold uppercase tracking-[0.2em] text-gray-900 dark:text-white relative group"
        >
          <span className="relative z-10">NeoWhisper</span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
        </Link>

        <div className="flex items-center gap-3">
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-3 text-xs font-semibold uppercase tracking-[0.15em] text-gray-600 dark:text-gray-300 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={withLang(item.href, currentLang)}
                className={`rounded-full border px-4 py-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/20 ${isActive(item.href)
                  ? "border-purple-500 bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                  : "border-white/20 bg-white/50 hover:bg-white dark:border-white/10 dark:bg-white/5"
                  }`}
              >
                {t.nav[item.key]}
              </Link>
            ))}
          </nav>

          {/* Language Switcher - Client only to avoid hydration mismatch */}
          {showLangSwitcher && (
            <nav aria-label="Language" className="hidden items-center gap-1 sm:flex" data-testid="language-switcher">
              <a
                href={currentPathWithoutLang || "/"}
                className={`px-3 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-medium rounded transition-colors ${currentLang === "en" ? "text-purple-600 dark:text-purple-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                hrefLang="en"
              >
                EN
              </a>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <a
                href={`${currentPathWithoutLang || "/"}?lang=ja`}
                className={`px-3 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-medium rounded transition-colors ${currentLang === "ja" ? "text-purple-600 dark:text-purple-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                hrefLang="ja"
              >
                JA
              </a>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <a
                href={`${currentPathWithoutLang || "/"}?lang=ar`}
                className={`px-3 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-medium rounded transition-colors ${currentLang === "ar" ? "text-purple-600 dark:text-purple-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                hrefLang="ar"
              >
                AR
              </a>
            </nav>
          )}

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Mobile Navigation Toggle */}
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-white/70 text-gray-800 shadow-sm transition-colors hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-gray-100 md:hidden pointer-events-auto cursor-pointer"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5 pointer-events-none" aria-hidden="true" /> : <Menu className="h-5 w-5 pointer-events-none" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="relative z-10 border-t border-white/20 bg-white/85 px-4 py-4 shadow-lg shadow-purple-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-gray-950/85 md:hidden">
          <nav aria-label="Mobile navigation" className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={withLang(item.href, currentLang)}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex min-h-[44px] items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${isActive(item.href)
                  ? "border-purple-600 bg-purple-600 text-white"
                  : "border-white/30 bg-white/70 text-gray-800 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-gray-100 dark:hover:bg-white/20"
                  }`}
              >
                {t.nav[item.key]}
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex items-center justify-between gap-3">
            {showLangSwitcher && (
              <nav aria-label="Mobile language" className="flex items-center gap-2 text-sm font-semibold">
                <a
                  href={currentPathWithoutLang || "/"}
                  className={`rounded-full px-3 py-2 ${currentLang === "en" ? "bg-purple-600 text-white" : "bg-white/70 text-gray-700 dark:bg-white/10 dark:text-gray-200"}`}
                  hrefLang="en"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  EN
                </a>
                <a
                  href={`${currentPathWithoutLang || "/"}?lang=ja`}
                  className={`rounded-full px-3 py-2 ${currentLang === "ja" ? "bg-purple-600 text-white" : "bg-white/70 text-gray-700 dark:bg-white/10 dark:text-gray-200"}`}
                  hrefLang="ja"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  JA
                </a>
                <a
                  href={`${currentPathWithoutLang || "/"}?lang=ar`}
                  className={`rounded-full px-3 py-2 ${currentLang === "ar" ? "bg-purple-600 text-white" : "bg-white/70 text-gray-700 dark:bg-white/10 dark:text-gray-200"}`}
                  hrefLang="ar"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AR
                </a>
              </nav>
            )}
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
