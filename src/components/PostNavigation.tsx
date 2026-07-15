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
            className="relative group flex h-full flex-col"
          >
            {/* Ambient Hover Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
            
            <div className="relative overflow-hidden flex flex-col flex-grow rounded-2xl border border-white/20 bg-white/40 p-5 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-xl">
              <div className="pointer-events-none absolute -top-20 -left-20 w-40 h-40 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl group-hover:bg-pink-500/20 dark:group-hover:bg-pink-500/30 transition-colors duration-700" />
              
              <div className="relative z-10 flex flex-col">
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
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Next Post */}
      {nextPost && (
        <div className={!hasBoth ? "w-full sm:w-1/2 ml-auto" : ""}>
          <Link
            href={`/blog/${encodeURIComponent(nextPost.slug)}`}
            className="relative group flex h-full flex-col"
          >
            {/* Ambient Hover Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
            
            <div className="relative overflow-hidden flex flex-col flex-grow rounded-2xl border border-white/20 bg-white/40 p-5 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-xl sm:items-end sm:text-right">
              <div className="pointer-events-none absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl group-hover:bg-pink-500/20 dark:group-hover:bg-pink-500/30 transition-colors duration-700" />
              
              <div className="relative z-10 flex flex-col items-start sm:items-end">
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
              </div>
            </div>
          </Link>
        </div>
      )}
    </nav>
  );
}
