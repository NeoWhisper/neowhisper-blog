import Image from "next/image";
import { ReactNode } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { formatDate } from "@/lib/utils";
import { AdSenseAd } from "@/components/AdSenseAd";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Post } from "@/types";
import ArticleCard from "@/components/ArticleCard";
import { buildCategorySlug } from "@/lib/categories";
import AuthorBio from "@/components/AuthorBio";
import { normalizeLang } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site-config";
import { ScrollProgress } from "@/components/ScrollProgress";
import { StickyToc } from "@/components/StickyToc";
import { ShareSocial } from "@/components/ShareSocial";
import { ImageZoom } from "@/components/ImageZoom";
import { SnapResolver } from "./SnapResolver";
import { headingToId, stripLeadingDuplicateTitleHeading, flattenText } from "@/lib/headings";
import CopyLinkButton from "./CopyLinkButton";
import PostNavigation from "./PostNavigation";

const siteUrl = SITE_URL;


function getCategoryUrl(category: string, lang: string): string {
  const slug = buildCategorySlug(category);
  if (normalizeLang(lang) === "en") {
    return `/category/${encodeURIComponent(slug)}`;
  }
  return `/category/${encodeURIComponent(slug)}?lang=${normalizeLang(lang)}`;
}

function toAbsoluteUrl(url: string): string {
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

function getUiText(lang: string) {
  const currentLang = normalizeLang(lang);
  const labels = {
    en: {
      backToBlog: "Back to Blog",
      relatedPosts: "Related Posts",
    },
    ja: {
      backToBlog: "ブログへ戻る",
      relatedPosts: "関連記事",
    },
    ar: {
      backToBlog: "العودة للمدونة",
      relatedPosts: "مقالات ذات صلة",
    },
  } as const;

  return labels[currentLang];
}

function getAuthorDisplayName(lang: string): string {
  const currentLang = normalizeLang(lang);
  const names: Record<string, string> = {
    ar: "يوسف القاضي",
    ja: "アルカーディ　ヨセフ",
  };
  return names[currentLang] || "Yousif Alqadi";
}

function estimateWordCount(mdxSource: string): number {
  const plain = mdxSource
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>\-[\]()`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plain ? plain.split(" ").length : 0;
}


function isLowValueBriefSlug(slug?: string): boolean {
  if (!slug) return false;
  return /(^|-)ai-(it-)?trend-brief-/.test(slug);
}

function shouldRenderAd(mdxSource: string, slug?: string): boolean {
  // Keep ad density low on short pages and suppress ads on brief-style roundup
  // posts to improve user value signals for policy review.
  if (isLowValueBriefSlug(slug)) return false;
  return estimateWordCount(mdxSource) >= 600;
}

interface BlogPostTemplateProps {
  slug?: string;
  title: string;
  date: string;
  content: string;
  renderedHtml?: string;
  coverImage?: string;
  category?: string;
  readTime?: string;
  isRTL?: boolean;
  availableLanguages?: string[];
  relatedPosts?: Post[];
  prevPost?: Post | null;
  nextPost?: Post | null;
  lang?: string;
  languageSwitchMode?: "suffix" | "query";
  canonicalUrl?: string;
}

export default function BlogPostTemplate({
  slug,
  title,
  date,
  content,
  renderedHtml,
  coverImage,
  category,
  readTime,
  isRTL = false,
  availableLanguages,
  relatedPosts = [],
  prevPost,
  nextPost,
  lang = "en",
  languageSwitchMode = "suffix",
  canonicalUrl,
}: BlogPostTemplateProps) {
  const displayContent = stripLeadingDuplicateTitleHeading(content, title);
  const ui = getUiText(lang);
  const currentLang = normalizeLang(lang);
  const wordCount = estimateWordCount(displayContent);
  const showAd = shouldRenderAd(displayContent, slug);
  const authorName = getAuthorDisplayName(lang);
  const resolvedCanonicalUrl =
    canonicalUrl ??
    (slug
      ? `${siteUrl}/blog/${encodeURIComponent(slug)}`
      : `${siteUrl}/blog`);

  const blogHomeUrl =
    currentLang === "en" ? `${siteUrl}/blog` : `${siteUrl}/blog?lang=${currentLang}`;
  const categoryUrl = category ? `${siteUrl}${getCategoryUrl(category, currentLang)}` : undefined;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    datePublished: date,
    dateModified: date,
    wordCount,
    inLanguage: currentLang,
    mainEntityOfPage: resolvedCanonicalUrl,
    image: coverImage ? [toAbsoluteUrl(coverImage)] : undefined,
    author: {
      "@type": "Person",
      name: authorName,
      url: `${siteUrl}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "NeoWhisper",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/og-image.jpg`,
      },
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Blog",
        item: blogHomeUrl,
      },
      ...(category && categoryUrl
        ? [
          {
            "@type": "ListItem",
            position: 2,
            name: category,
            item: categoryUrl,
          },
        ]
        : []),
      {
        "@type": "ListItem",
        position: category && categoryUrl ? 3 : 2,
        name: title,
        item: resolvedCanonicalUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <ScrollProgress />
      <StickyToc isRTL={isRTL} />
      <div className="max-w-7xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
        <div className="relative">
          {/* Sticky Share Widget - Hidden on mobile, shown on desktop */}
          <div
            className={`hidden lg:flex fixed top-1/2 transform -translate-y-1/2 z-30 flex-col items-center gap-2`}
            style={{
              [isRTL ? "right" : "left"]: "calc((100vw - 1024px) / 2 - 60px)",
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4 whitespace-nowrap">
              {isRTL ? "شارك" : "Share"}
            </span>
            <ShareSocial
              title={title}
              url={resolvedCanonicalUrl}
            />
          </div>

          <article className="max-w-3xl mx-auto w-full" lang={currentLang}>
            <SnapResolver />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            {/* Back Button */}
            <Link
              href={currentLang === "en" ? "/blog" : `/blog?lang=${currentLang}`}
              className={`inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-8 group transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <svg
                className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${isRTL ? "ml-2 rotate-180 group-hover:translate-x-1" : "mr-2"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {ui.backToBlog}
            </Link>

            {/* Post Card with Glassmorphism */}
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-3xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              {/* Hero Image (if provided) */}
              {coverImage && (
                <div className="relative h-64 sm:h-96 w-full overflow-hidden">
                  <Image
                    src={coverImage}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>
              )}

              {/* Post Header */}
              <header
                className={`px-6 sm:px-12 py-8 border-b border-gray-200 dark:border-gray-700 ${isRTL ? "text-right" : "text-left"}`}
              >
                {/* Language Switcher - Top Right/Left depending on LTR/RTL */}
                <div
                  className={`flex mb-6 ${isRTL ? "justify-start" : "justify-end"}`}
                >
                  <LanguageSwitcher
                    availableLanguages={availableLanguages}
                    mode={languageSwitchMode}
                    currentLang={lang}
                  />
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 mt-4 leading-tight">
                  {title}
                </h1>


                {/* Metadata */}
                <div
                  className={`flex flex-wrap items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <time
                    dateTime={date}
                    className="inline-block text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/20 px-4 py-2 rounded-full border border-purple-200/50 dark:border-purple-800/30"
                  >
                    {formatDate(date)}
                  </time>

                  {readTime && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {readTime}
                      </span>
                    </>
                  )}

                  {category && (
                    <>
                      <span className="text-gray-400">•</span>
                      <Link
                        href={getCategoryUrl(category, lang)}
                        className="inline-block text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-200/70 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        {category}
                      </Link>
                    </>
                  )}
                </div>
              </header>

              {/* Post Content */}
              <div
                className={`px-6 sm:px-12 py-8 prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-h1:text-[3rem] prose-h1:leading-[1.2] prose-h1:mb-10 prose-h1:tracking-[-0.025em]
            prose-h2:text-3xl sm:prose-h2:text-4xl prose-h2:mt-16 sm:prose-h2:mt-20 prose-h2:mb-12 prose-h2:font-bold
            prose-h3:text-2xl prose-h3:mt-12 sm:prose-h3:mt-16 prose-h3:mb-8
            prose-p:text-lg prose-p:leading-[1.8] prose-p:mb-10
            prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-li:text-lg prose-li:mb-6 prose-li:leading-[1.8] marker:text-purple-500
            prose-ul:my-10 prose-ol:my-10
            prose-hr:my-32 prose-hr:border-gray-200 dark:prose-hr:border-gray-800
            prose-table:my-0 prose-table:w-full prose-table:border-collapse prose-table:text-base prose-table:leading-[1.65]
            prose-thead:bg-gray-100/70 dark:prose-thead:bg-gray-800/50
            prose-th:px-4 prose-th:py-3 prose-th:font-semibold prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-700
            prose-td:px-4 prose-td:py-3 prose-td:align-top prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700
            prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:bg-purple-50/50 dark:prose-blockquote:bg-purple-900/10 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:mb-16
            prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-xl prose-pre:mb-16 prose-pre:max-w-full prose-pre:overflow-x-auto prose-code:break-words
            ${isRTL ? "text-right" : "text-left"}`}
              >
                {renderedHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
                ) : (
                  <MDXRemote
                    source={displayContent}
                    components={{
                      h2: (props) => {
                        const text = flattenText(props.children);
                        const isToc = ["Table of Contents", "目次", "المحتويات"].includes(text.trim());
                        return (
                          <h2
                            id={headingToId(props.children)}
                            className={
                              isToc
                                ? "text-xl font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest py-4 border-y border-gray-200 dark:border-gray-800 mt-12 mb-8 scroll-mt-28"
                                : "text-3xl sm:text-4xl font-bold mt-16 sm:mt-20 mb-12 scroll-mt-28"
                            }
                            {...props}
                          />
                        );
                      },
                      h3: (props) => (
                        <h3
                          id={headingToId(props.children)}
                          className="text-2xl font-bold mt-20 mb-10 scroll-mt-28"
                          {...props}
                        />
                      ),
                      hr: (props) => (
                        <hr
                          className="my-24 border-gray-200 dark:border-gray-800"
                          {...props}
                        />
                      ),
                      ol: (props) => (
                        <ol className="list-decimal pl-6 mt-12 mb-12" {...props} />
                      ),
                      img: (props) => (
                        <ImageZoom
                          src={props.src || ""}
                          alt={props.alt || ""}
                          title={props.title}
                          className="my-12 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-full h-auto"
                        />
                      ),
                      a: ({ href, children, ...props }) => {
                        const isExternal = href?.startsWith("http");
                        return (
                          <a
                            href={href}
                            className="animated-link text-purple-600 dark:text-purple-400 font-medium inline-flex items-center group"
                            {...(isExternal
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                            {...props}
                          >
                            <span className="relative">{children}</span>
                            {isExternal && (
                              <svg
                                className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            )}
                          </a>
                        );
                      },
                      table: ({ className, ...props }) => (
                        <div className="mt-8 mb-16 overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 w-full scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                          <table
                            className={`w-full min-w-[500px] border-collapse text-base leading-[1.65] ${className ?? ""}`}
                            {...props}
                          />
                        </div>
                      ),
                      tbody: ({ className, ...props }) => (
                        <tbody
                          className={`${className ?? ""} [&>tr:nth-child(even)]:bg-gray-50/50 dark:[&>tr:nth-child(even)]:bg-gray-900/20`}
                          {...props}
                        />
                      ),
                      tr: ({ className, ...props }) => (
                        <tr
                          className={`${className ?? ""} border-b border-gray-200 dark:border-gray-700 last:border-b-0`}
                          {...props}
                        />
                      ),
                      th: ({ className, ...props }) => (
                        <th
                          className={`${className ?? ""} px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 bg-gray-100/90 dark:bg-gray-800/80 backdrop-blur sticky top-0 z-10 ${isRTL ? "text-right" : "text-left"}`}
                          {...props}
                        />
                      ),
                      td: ({ className, ...props }) => (
                        <td
                          className={`${className ?? ""} px-4 py-3 align-top whitespace-normal break-words first:font-medium first:text-gray-900 dark:first:text-gray-100 ${isRTL ? "text-right" : "text-left"}`}
                          {...props}
                        />
                      ),
                      // Professional block components for MDX
                      Step: ({ number, title, children }: { number: string | number; title?: string; children: ReactNode }) => (
                        <div className="flex gap-6 mb-16 group items-start">
                          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20 transition-transform group-hover:scale-110">
                            {number}
                          </div>
                          <div className="flex-1">
                            {title && <h3 className="text-2xl font-bold mb-4 mt-0">{title}</h3>}
                            <div className="text-gray-600 dark:text-gray-300 leading-[2.2]">{children}</div>
                          </div>
                        </div>
                      ),
                      Callout: ({ type = 'info', children }: { type?: 'info' | 'warning' | 'success' | 'tldr', children: ReactNode }) => {
                        let styles: string;
                        let icon: ReactNode = null;

                        switch (type) {
                          case 'tldr':
                            styles = 'bg-purple-50/60 border-purple-300 dark:bg-purple-900/15 dark:border-purple-700/50 text-purple-900 dark:text-purple-200';
                            icon = (
                              <div className="flex items-center gap-2 mb-4 text-purple-600 dark:text-purple-400 font-bold text-sm uppercase tracking-widest">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                TL;DR
                              </div>
                            );
                            break;
                          case 'warning':
                            styles = 'bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800/50 text-amber-800 dark:text-amber-300';
                            break;
                          case 'success':
                            styles = 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300';
                            break;
                          case 'info':
                          default:
                            styles = 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800/50 text-blue-800 dark:text-blue-300';
                            break;
                        }

                        return (
                          <div className={`my-12 p-8 rounded-2xl border ${styles} leading-[2.2]`}>
                            {icon}
                            {children}
                          </div>
                        );
                      },
                      Checklist: ({ children }: { children: ReactNode }) => (
                        <div className="my-16 space-y-4 bg-white/30 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-white/10">
                          {children}
                        </div>
                      ),
                      CheckItem: ({ children }: { children: ReactNode }) => (
                        <div className="flex items-start gap-4">
                          <div className="mt-1.5 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-gray-700 dark:text-gray-200">{children}</span>
                        </div>
                      ),
                    }}
                    options={{
                      mdxOptions: {
                        remarkPlugins: [remarkGfm],
                        rehypePlugins: [rehypeHighlight],
                      },
                    }}
                  />
                )}
              </div>
            </div>

            {/* Author Bio */}
            <AuthorBio lang={lang} isRTL={isRTL} />

            {/* Copy Link Button */}
            <div className={`mt-6 flex ${isRTL ? "justify-end" : "justify-start"}`}>
              <CopyLinkButton url={resolvedCanonicalUrl} lang={lang} />
            </div>

            {/* Post Navigation */}
            <PostNavigation prevPost={prevPost || null} nextPost={nextPost || null} lang={lang} />

            {/* Share Widget - Mobile Only */}
            <div className={`lg:hidden mt-8 py-8 border-t border-gray-200 dark:border-gray-700 flex ${isRTL ? "justify-end" : "justify-start"} items-center gap-4`}>
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {isRTL ? "شارك" : "Share"}
              </span>
              <ShareSocial
                title={title}
                url={resolvedCanonicalUrl}
              />
            </div>
            {/* Bottom Ad Unit */}
            {showAd && (
              <div className="mt-8">
                <AdSenseAd slot="5462294096" />
              </div>
            )}
          </article>
        </div>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <section className={`mt-16 ${isRTL ? "text-right" : "text-left"}`}>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
              {ui.relatedPosts}
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((post) => (
                <ArticleCard key={post.slug} post={post} lang={lang} />
              ))}
            </div>
          </section>
        )}

        {/* Footer: Category Link and Back Button */}
        <div
          className={`mt-12 flex flex-col items-center gap-4 ${isRTL ? "text-right" : "text-left"}`}
        >
          {category && (
            <div>
              <Link
                href={getCategoryUrl(category, lang)}
                className="inline-block text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-200/70 dark:hover:bg-blue-900/40 transition-colors"
              >
                {category}
              </Link>
            </div>
          )}
          <Link
            href={`/blog?lang=${lang}`}
            className={`inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 group transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <svg
              className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${isRTL ? "ml-2 rotate-180 group-hover:translate-x-1" : "mr-2"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {ui.backToBlog}
          </Link>
        </div>
      </div>
    </div>
  );
}
