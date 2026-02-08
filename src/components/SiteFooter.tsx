"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { normalizeLang, type SupportedLang, withLang } from "@/lib/i18n";

function getLabel(key: "privacy" | "terms" | "contact", lang: SupportedLang) {
  const labels: Record<SupportedLang, Record<typeof key, string>> = {
    en: { privacy: "Privacy", terms: "Terms", contact: "Contact" },
    ja: { privacy: "プライバシー", terms: "利用規約", contact: "お問い合わせ" },
    ar: { privacy: "الخصوصية", terms: "الشروط", contact: "تواصل" },
  };

  return labels[lang][key];
}

export default function SiteFooter() {
  const searchParams = useSearchParams();
  const currentLang = normalizeLang(searchParams?.get("lang")) as SupportedLang;

  return (
    <footer className="border-t border-white/5 bg-black/40 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-xs text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 NeoWhisper. All rights reserved.</span>
        <div className="flex flex-wrap items-center gap-3" dir="ltr">
          <Link
            className="hover:text-white transition-colors"
            href={withLang("/privacy", currentLang)}
          >
            {getLabel("privacy", currentLang)}
          </Link>
          <Link
            className="hover:text-white transition-colors"
            href={withLang("/terms", currentLang)}
          >
            {getLabel("terms", currentLang)}
          </Link>
          <Link
            className="hover:text-white transition-colors"
            href={withLang("/contact", currentLang)}
          >
            {getLabel("contact", currentLang)}
          </Link>
        </div>
      </div>
    </footer>
  );
}

