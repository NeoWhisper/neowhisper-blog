"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const searchParams = useSearchParams();
  const currentLang = normalizeLang(searchParams?.get("lang") || "en") as SupportedLang;
  const isRTL = currentLang === "ar";
  const t = getDictionary(currentLang);

  useEffect(() => {
    let consent: string | null = null;
    try {
      consent = localStorage.getItem("cookie-consent");
    } catch {
      consent = null;
    }
    if (!consent) {
      // Show banner after a short delay (better UX)
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("cookie-consent", "accepted");
    } catch {
      // Ignore storage errors
    }
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem("cookie-consent", "declined");
    } catch {
      // Ignore storage errors
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 sm:px-6 lg:px-8">
          <div
            className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}
          >
            {/* Message */}
            <div className="flex-1">
              <p
                className={`text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
              >
                {t.cookie.message}{" "}
                <Link
                  href={`/privacy?lang=${currentLang}`}
                  className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  {t.cookie.learnMore}
                </Link>
              </p>
            </div>

            {/* Buttons */}
            <div
              className={`flex gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto justify-end ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <button
                onClick={handleDecline}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                aria-label={t.cookie.decline}
              >
                {t.cookie.decline}
              </button>
              <button
                onClick={handleAccept}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                aria-label={t.cookie.accept}
              >
                {t.cookie.accept}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
