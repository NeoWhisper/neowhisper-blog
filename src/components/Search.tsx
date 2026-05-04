"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Post } from "@/types";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

interface SearchProps {
  posts: Post[];
  lang?: string;
}

const labels: Record<SupportedLang, { placeholder: string; noResults: string; by: string }> = {
  en: {
    placeholder: "Search articles...",
    noResults: "No articles found",
    by: "by",
  },
  ja: {
    placeholder: "記事を検索...",
    noResults: "記事が見つかりません",
    by: "著者",
  },
  ar: {
    placeholder: "البحث في المقالات...",
    noResults: "لم يتم العثور على مقالات",
    by: "بواسطة",
  },
};

export default function Search({ posts, lang }: SearchProps) {
  const currentLang = normalizeLang(lang) as SupportedLang;
  const t = labels[currentLang];
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  // Initialize Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(posts, {
      keys: [
        { name: "title", weight: 0.5 },
        { name: "excerpt", weight: 0.3 },
        { name: "category", weight: 0.2 },
      ],
      threshold: 0.3,
      includeScore: true,
    });
  }, [posts]);

  // Get search results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).slice(0, 8); // Limit to 8 results
  }, [query, fuse]);

  // Reset selection when results change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: reset selection when query changes
    setSelectedIndex(-1);
  }, [query]);

  // Handle keyboard shortcuts and navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
        return;
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        setSelectedIndex(-1);
        return;
      }

      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = prev < results.length - 1 ? prev + 1 : 0;
            resultsRef.current[next]?.scrollIntoView({ block: "nearest" });
            return next;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : results.length - 1;
            resultsRef.current[next]?.scrollIntoView({ block: "nearest" });
            return next;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            const selectedPost = results[selectedIndex].item;
            window.location.href = `/blog/${encodeURIComponent(selectedPost.slug)}`;
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {/* Search trigger button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 rounded-full border border-white/20 bg-white/60 px-4 py-2 text-sm text-gray-600 transition-all duration-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">{t.placeholder}</span>
        <kbd className="hidden rounded border border-gray-300 bg-gray-100 px-1.5 text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 md:inline">
          ⌘K
        </kbd>
      </button>

      {/* Search modal */}
      {isOpen && (
        <div role="dialog" aria-modal="true" aria-label="Search" className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[15vh] backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900">
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-gray-700">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.placeholder}
                className="flex-1 bg-transparent text-lg outline-none placeholder:text-gray-400 dark:text-white"
              />
              <kbd className="rounded border border-gray-300 bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {query.trim() === "" ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm">{t.placeholder}</p>
                  <p className="mt-2 text-xs opacity-70">
                    {currentLang === "ja" ? "検索を開始するには入力してください" : currentLang === "ar" ? "اكتب للبحث" : "Type to search"}
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm">{t.noResults}</p>
                </div>
              ) : (
                <ul className="space-y-1" role="listbox">
                  {results.map(({ item }, index) => (
                    <li key={item.slug} role="option" aria-selected={selectedIndex === index}>
                      <Link
                        ref={(el) => { resultsRef.current[index] = el; }}
                        href={`/blog/${encodeURIComponent(item.slug)}`}
                        onClick={() => {
                          setIsOpen(false);
                          setQuery("");
                          setSelectedIndex(-1);
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`block rounded-lg p-3 transition-colors ${
                          selectedIndex === index
                            ? "bg-purple-100 dark:bg-purple-900/30"
                            : "hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {item.coverImage && (
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.coverImage}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {item.title}
                            </h3>
                            {item.excerpt && (
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {item.excerpt}
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                              {item.category && (
                                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                  {item.category}
                                </span>
                              )}
                              <span>{item.readTime}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span>
                  {currentLang === "ja" ? `${results.length} 件の結果` : currentLang === "ar" ? `${results.length} نتيجة` : `${results.length} results`}
                </span>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-gray-300 bg-white px-1 dark:border-gray-600 dark:bg-gray-700">↑↓</kbd>
                    {currentLang === "ja" ? "選択" : currentLang === "ar" ? "تحديد" : "Navigate"}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-gray-300 bg-white px-1 dark:border-gray-600 dark:bg-gray-700">↵</kbd>
                    {currentLang === "ja" ? "開く" : currentLang === "ar" ? "فتح" : "Open"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
