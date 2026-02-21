"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { Suspense } from "react";
import { adminStrings, normalizeAdminLang } from "./i18n";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const lang = normalizeAdminLang(searchParams.get("lang"));

  const t = adminStrings[lang].layout;

  return (
    <div
      lang={lang}
      className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900"
    >
      <header className="border-b border-white/8 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/20 ring-1 ring-purple-500/40">
              <svg
                className="h-3 w-3 text-purple-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              NeoWhisper <span className="text-purple-400">/</span> Admin
            </span>
            <span className="text-gray-600">|</span>
            <Link
              href={lang === "ja" ? pathname : `${pathname}?lang=ja`}
              className={`text-xs ${lang === "ja" ? "text-purple-400 font-medium" : "text-gray-500 hover:text-gray-300"}`}
            >
              日本語
            </Link>
            <Link
              href={lang === "en" ? pathname : `${pathname}?lang=en`}
              className={`text-xs ${lang === "en" ? "text-purple-400 font-medium" : "text-gray-500 hover:text-gray-300"}`}
            >
              EN
            </Link>
          </div>

          <Link
            href="/"
            className="text-xs text-gray-500 transition-colors hover:text-gray-300"
          >
            {t.backToSite}
          </Link>
        </div>
      </header>

      {/* Admin Nav Tabs */}
      <div className="border-b border-white/8 bg-black/10">
        <div className="mx-auto flex max-w-3xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Link
            href={`/admin${lang === "ja" ? "?lang=ja" : ""}`}
            className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${pathname === "/admin" ? "border-purple-400 text-purple-400" : "border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200"}`}
          >
            {t.newPost}
          </Link>
          <Link
            href={`/admin/posts${lang === "ja" ? "?lang=ja" : ""}`}
            className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${pathname === "/admin/posts" ? "border-purple-400 text-purple-400" : "border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200"}`}
          >
            {t.managePosts}
          </Link>
        </div>
      </div>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-white/8 py-4 text-center">
        <p className="text-xs text-gray-700">{t.internalOnly}</p>
      </footer>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
