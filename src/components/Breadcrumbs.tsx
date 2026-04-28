"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

interface BreadcrumbItem {
  label: string;
  href: string;
}

const labels: Record<SupportedLang, Record<string, string>> = {
  en: {
    services: "Services",
    projects: "Projects",
    roadmap: "Roadmap",
    blog: "Blog",
    about: "About",
    contact: "Contact",
    category: "Category",
    privacy: "Privacy",
    terms: "Terms",
    editorial: "Editorial Policy",
    faq: "FAQ",
  },
  ja: {
    services: "サービス",
    projects: "プロジェクト",
    roadmap: "ロードマップ",
    blog: "ブログ",
    about: "概要",
    contact: "お問い合わせ",
    category: "カテゴリ",
    privacy: "プライバシー",
    terms: "利用規約",
    editorial: "編集ポリシー",
    faq: "よくある質問",
  },
  ar: {
    services: "الخدمات",
    projects: "المشاريع",
    roadmap: "خارطة الطريق",
    blog: "المدونة",
    about: "نبذة",
    contact: "تواصل",
    category: "التصنيف",
    privacy: "الخصوصية",
    terms: "الشروط",
    editorial: "سياسة التحرير",
    faq: "الأسئلة الشائعة",
  },
};

export default function Breadcrumbs({ lang }: { lang?: string }) {
  const pathname = usePathname();
  const currentLang = normalizeLang(lang) as SupportedLang;
  const isRTL = currentLang === "ar";

  if (!pathname || pathname === "/") {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // Home is always first
  items.push({
    label: currentLang === "ja" ? "ホーム" : currentLang === "ar" ? "الرئيسية" : "Home",
    href: currentLang === "en" ? "/" : `/?lang=${currentLang}`,
  });

  // Build path segments
  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Skip if it's a blog post slug (we show "Blog" instead)
    if (segment === "blog" && segments[index + 1] && !segments[index + 2]) {
      items.push({
        label: labels[currentLang].blog,
        href: currentLang === "en" ? "/blog" : `/blog?lang=${currentLang}`,
      });
      return;
    }

    // For blog post slugs, just show "Blog" as the parent
    if (index > 0 && segments[index - 1] === "blog") {
      // Don't add individual post titles to breadcrumbs
      return;
    }

    // For category pages
    if (segment === "category" && segments[index + 1]) {
      items.push({
        label: labels[currentLang].category,
        href: currentLang === "en" ? "/blog" : `/blog?lang=${currentLang}`,
      });
      return;
    }

    const label = labels[currentLang][segment] ||
      segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    items.push({
      label,
      href: currentLang === "en" ? currentPath : `${currentPath}?lang=${currentLang}`,
    });
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="py-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <ol className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {index > 0 && (
              <svg
                className={`h-4 w-4 flex-shrink-0 ${isRTL ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {index === items.length - 1 ? (
              <span
                className="font-medium text-gray-900 dark:text-gray-200"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
