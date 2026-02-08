"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { normalizeLang } from "@/lib/i18n";

interface CookieContent {
  message: string;
  learnMore: string;
  accept: string;
  decline: string;
}

const content: Record<string, CookieContent> = {
  en: {
    message:
      "We use cookies to enhance your experience, analyze site traffic, and for marketing purposes. By clicking 'Accept', you consent to our use of cookies.",
    learnMore: "Learn more",
    accept: "Accept",
    decline: "Decline",
  },
  ja: {
    message:
      "当サイトでは、ユーザー体験の向上、サイトトラフィックの分析、マーケティング目的でCookieを使用しています。「同意する」をクリックすると、Cookieの使用に同意したことになります。",
    learnMore: "詳細を見る",
    accept: "同意する",
    decline: "拒否する",
  },
  ar: {
    message:
      "نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربتك وتحليل حركة الموقع ولأغراض التسويق. بالنقر على 'موافق'، فإنك توافق على استخدامنا لملفات تعريف الارتباط.",
    learnMore: "معرفة المزيد",
    accept: "موافق",
    decline: "رفض",
  },
};

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const searchParams = useSearchParams();
  const lang = normalizeLang(searchParams?.get("lang") || "en");
  const isRTL = lang === "ar";
  const text = content[lang] || content.en;

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Show banner after a short delay (better UX)
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div
            className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}
          >
            {/* Message */}
            <div className="flex-1">
              <p
                className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
              >
                {text.message}{" "}
                <Link
                  href={`/privacy?lang=${lang}`}
                  className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  {text.learnMore}
                </Link>
              </p>
            </div>

            {/* Buttons */}
            <div
              className={`flex gap-3 flex-shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                aria-label={text.decline}
              >
                {text.decline}
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                aria-label={text.accept}
              >
                {text.accept}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
