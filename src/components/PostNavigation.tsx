"use client";

import Link from "next/link";
import { Post } from "@/types";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

interface PostNavigationProps {
  prevPost: Post | null;
  nextPost: Post | null;
  lang?: string;
}

const labels: Record<SupportedLang, { prev: string; next: string }> = {
  en: {
    prev: "Previous Article",
    next: "Next Article",
  },
  ja: {
    prev: "前の記事",
    next: "次の記事",
  },
  ar: {
    prev: "المقال السابق",
    next: "المقال التالي",
  },
};

export default function PostNavigation({ prevPost, nextPost, lang }: PostNavigationProps) {
  const currentLang = normalizeLang(lang) as SupportedLang;
  const t = labels[currentLang];
  const isRTL = currentLang === "ar";

  // If both are null, don't render
  if (!prevPost && !nextPost) return null;

  return (
    <nav
      className="mt-12 grid gap-4 border-t border-gray-200 pt-8 dark:border-gray-700 sm:grid-cols-2"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Previous Post */}
      <div className={!prevPost ? "hidden sm:block" : ""}>
        {prevPost ? (
          <Link
            href={`/blog/${encodeURIComponent(prevPost.slug)}`}
            className="group flex flex-col rounded-2xl border border-white/20 bg-white/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
          >
            <span className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              <svg
                className={`h-4 w-4 transition-transform group-hover:-translate-x-1 ${isRTL ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t.prev}
            </span>
            <span className="line-clamp-2 font-semibold text-gray-900 dark:text-white">
              {prevPost.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Next Post */}
      <div className={!nextPost ? "hidden sm:block" : ""}>
        {nextPost ? (
          <Link
            href={`/blog/${encodeURIComponent(nextPost.slug)}`}
            className="group flex flex-col rounded-2xl border border-white/20 bg-white/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5 sm:items-end sm:text-right"
          >
            <span className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 sm:flex-row-reverse">
              {t.next}
              <svg
                className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isRTL ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <span className="line-clamp-2 font-semibold text-gray-900 dark:text-white">
              {nextPost.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
