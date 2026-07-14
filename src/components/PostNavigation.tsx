"use client";

import Link from "next/link";
import { Post } from "@/types";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";

interface PostNavigationProps {
  prevPost: Post | null;
  nextPost: Post | null;
  lang?: string;
}

export default function PostNavigation({ prevPost, nextPost, lang }: PostNavigationProps) {
  const currentLang = normalizeLang(lang) as SupportedLang;
  const t = getDictionary(currentLang);
  const isRTL = currentLang === "ar";

  // If both are null, don't render
  if (!prevPost && !nextPost) return null;

  // Determine grid layout based on available posts
  const hasBoth = prevPost && nextPost;
  const gridClasses = hasBoth 
    ? "grid gap-4 sm:grid-cols-2" 
    : "flex flex-col sm:flex-row gap-4 justify-between";

  return (
    <nav
      className={`mt-12 border-t border-gray-200 pt-8 dark:border-gray-700 ${gridClasses}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Previous Post */}
      {prevPost && (
        <div className={!hasBoth ? "w-full sm:w-1/2" : ""}>
          <Link
            href={`/blog/${encodeURIComponent(prevPost.slug)}`}
            className="group flex h-full flex-col rounded-2xl border border-white/20 bg-white/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
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
              {t.actions.prevArticle}
            </span>
            <span className="line-clamp-2 font-semibold text-gray-900 dark:text-white">
              {prevPost.title}
            </span>
          </Link>
        </div>
      )}

      {/* Next Post */}
      {nextPost && (
        <div className={!hasBoth ? "w-full sm:w-1/2 ml-auto" : ""}>
          <Link
            href={`/blog/${encodeURIComponent(nextPost.slug)}`}
            className="group flex h-full flex-col rounded-2xl border border-white/20 bg-white/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5 sm:items-end sm:text-right"
          >
            <span className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 sm:flex-row-reverse">
              {t.actions.nextArticle}
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
        </div>
      )}
    </nav>
  );
}
