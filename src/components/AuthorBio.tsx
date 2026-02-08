"use client";

import Image from "next/image";
import Link from "next/link";

interface AuthorBioProps {
  lang?: string;
  isRTL?: boolean;
}

interface AuthorContent {
  title: string;
  bio: string;
  expertise: string;
  cta: string;
  whyTrust: string;
  trustPoints: string[];
}

const content: Record<string, AuthorContent> = {
  en: {
    title: "About the Author",
    bio: "NeoWhisper is a full-stack development studio specializing in modern web applications with Next.js, TypeScript, and cutting-edge tools. We build fast, scalable, and beautiful digital experiences for clients worldwide.",
    expertise: "Expertise: Next.js • TypeScript • React • Node.js • Multilingual Sites • SEO • Performance Optimization",
    cta: "Work with us",
    whyTrust: "Why Trust NeoWhisper?",
    trustPoints: [
      "Production-proven patterns from real-world projects",
      "Deep expertise in multilingual web architecture (EN/JA/AR)",
      "Focus on performance, SEO, and user experience",
      "Transparent approach with open-source contributions",
    ],
  },
  ja: {
    title: "著者について",
    bio: "NeoWhisperは、Next.js、TypeScript、最先端ツールを使用したモダンなWebアプリケーションを専門とするフルスタック開発スタジオです。世界中のクライアントに向けて、高速でスケーラブルかつ美しいデジタル体験を構築しています。",
    expertise: "専門分野: Next.js • TypeScript • React • Node.js • 多言語サイト • SEO • パフォーマンス最適化",
    cta: "お問い合わせ",
    whyTrust: "NeoWhisperを信頼する理由",
    trustPoints: [
      "実際のプロジェクトで実証済みの本番環境対応パターン",
      "多言語Webアーキテクチャ（EN/JA/AR）の深い専門知識",
      "パフォーマンス、SEO、ユーザー体験への注力",
      "オープンソースへの貢献を通じた透明性のあるアプローチ",
    ],
  },
  ar: {
    title: "عن المؤلف",
    bio: "NeoWhisper هو استوديو تطوير متكامل متخصص في تطبيقات الويب الحديثة باستخدام Next.js وTypeScript وأحدث الأدوات. نبني تجارب رقمية سريعة وقابلة للتوسع وجميلة للعملاء في جميع أنحاء العالم.",
    expertise: "الخبرة: Next.js • TypeScript • React • Node.js • مواقع متعددة اللغات • SEO • تحسين الأداء",
    cta: "تواصل معنا",
    whyTrust: "لماذا تثق في NeoWhisper؟",
    trustPoints: [
      "أنماط مثبتة في الإنتاج من مشاريع واقعية",
      "خبرة عميقة في بنية الويب متعددة اللغات (EN/JA/AR)",
      "التركيز على الأداء وSEO وتجربة المستخدم",
      "نهج شفاف مع مساهمات مفتوحة المصدر",
    ],
  },
};

export default function AuthorBio({ lang = "en", isRTL = false }: AuthorBioProps) {
  const text = content[lang] || content.en;

  return (
    <section
      className="mt-12 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 backdrop-blur-sm rounded-2xl border border-purple-200/30 dark:border-purple-800/30 overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className={`flex items-start gap-6 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
          {/* Author Image */}
          <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-purple-200/50 dark:ring-purple-800/30">
            <Image
              src="/images/author.png"
              alt="NeoWhisper"
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>

          {/* Title and Name */}
          <div className={isRTL ? "text-right" : "text-left"}>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
              {text.title}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              NeoWhisper
            </h3>

            {/* Social Links */}
            <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Link
                href="https://github.com/NeoWhisper"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link
                href="https://twitter.com/neowhisper"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className={`text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4 ${isRTL ? "text-right" : "text-left"}`}>
          {text.bio}
        </p>

        {/* Expertise Tags */}
        <p className={`text-sm text-gray-600 dark:text-gray-400 mb-6 ${isRTL ? "text-right" : "text-left"}`}>
          {text.expertise}
        </p>

        {/* Divider */}
        <hr className="border-purple-200/50 dark:border-purple-800/30 mb-6" />

        {/* Why Trust Section */}
        <div>
          <h4 className={`text-lg font-bold text-gray-900 dark:text-white mb-4 ${isRTL ? "text-right" : "text-left"}`}>
            {text.whyTrust}
          </h4>
          <ul className={`space-y-3 mb-6 ${isRTL ? "text-right" : "text-left"}`}>
            {text.trustPoints.map((point, index) => (
              <li key={index} className={`flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 ${isRTL ? "flex-row-reverse" : ""}`}>
                <svg
                  className={`w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5 ${isRTL ? "ml-2" : "mr-2"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <Link
            href={`/contact?lang=${lang}`}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            {text.cta}
            <svg
              className={`w-4 h-4 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
