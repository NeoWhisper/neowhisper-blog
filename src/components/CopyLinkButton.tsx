"use client";

import { useState } from "react";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

interface CopyLinkButtonProps {
  url: string;
  lang?: string;
}

const labels: Record<SupportedLang, { copy: string; copied: string }> = {
  en: {
    copy: "Copy link",
    copied: "Copied!",
  },
  ja: {
    copy: "リンクをコピー",
    copied: "コピーしました！",
  },
  ar: {
    copy: "نسخ الرابط",
    copied: "تم النسخ!",
  },
};

export default function CopyLinkButton({ url, lang }: CopyLinkButtonProps) {
  const currentLang = normalizeLang(lang) as SupportedLang;
  const t = labels[currentLang];
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-full border border-white/20 bg-white/60 px-3 py-1.5 text-xs font-medium text-gray-700 transition-all duration-300 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
      aria-label={copied ? t.copied : t.copy}
    >
      {copied ? (
        <>
          <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{t.copied}</span>
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>{t.copy}</span>
        </>
      )}
    </button>
  );
}
