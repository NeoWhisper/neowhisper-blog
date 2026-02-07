import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import rehypeHighlight from 'rehype-highlight';
import { formatDate } from '@/lib/utils';
import { AdSenseAd } from '@/components/AdSenseAd';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Post } from '@/types';
import ArticleCard from '@/components/ArticleCard';

// Helper function to create a category slug (matches sitemap.ts and category page)
function createCategorySlug(category: string): string {
    if (category === 'Next.js') {
        return 'next.js';
    }
    return category.toLowerCase().replace(/\s+/g, '-');
}

// Helper function to get category URL
function getCategoryUrl(category: string): string {
    const slug = createCategorySlug(category);
    return `/category/${encodeURIComponent(slug)}`;
}

interface BlogPostTemplateProps {
    title: string;
    date: string;
    content: string;
    coverImage?: string;
    category?: string;
    readTime?: string;
    isRTL?: boolean;
    availableLanguages?: string[];
    relatedPosts?: Post[];
    lang?: string;
}

export default function BlogPostTemplate({
    title,
    date,
    content,
    coverImage,
    category,
    readTime,
    isRTL = false,
    availableLanguages,
    relatedPosts = [],
    lang = "en"
}: BlogPostTemplateProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
                <article className="max-w-3xl mx-auto">
                    {/* Back Button */}
                    <Link
                        href={`/blog?lang=${lang}`}
                        className={`inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-8 group transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                        <svg
                            className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${isRTL ? 'ml-2 rotate-180 group-hover:translate-x-1' : 'mr-2'}`}
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
                        {isRTL ? 'العودة للمدونة' : 'Back to Blog'}
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
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            </div>
                        )}

                        {/* Post Header */}
                        <header className={`px-6 sm:px-12 py-8 border-b border-gray-200 dark:border-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {/* Language Switcher - Top Right/Left depending on LTR/RTL */}
                            <div className={`flex mb-6 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                                <LanguageSwitcher availableLanguages={availableLanguages} />
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
                                {title}
                            </h1>

                            {/* Metadata */}
                            <div className={`flex flex-wrap items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
                                            href={getCategoryUrl(category)}
                                            className="inline-block text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-200/70 dark:hover:bg-blue-900/40 transition-colors"
                                        >
                                            {category}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </header>

                        {/* Top Ad Unit */}
                        <div className="px-6 sm:px-12 py-4 border-b border-gray-200 dark:border-gray-700">
                            <AdSenseAd slot="5462294096" />
                        </div>

                        {/* Post Content */}
                        <div className={`px-6 sm:px-12 py-8 prose prose-lg dark:prose-invert max-w-none 
            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-h1:text-[3rem] prose-h1:leading-[1.2] prose-h1:mb-10 prose-h1:tracking-[-0.025em]
            prose-h2:text-4xl prose-h2:mt-32 prose-h2:mb-16 prose-h2:font-bold
            prose-h3:text-2xl prose-h3:mt-20 prose-h3:mb-10
            prose-p:text-lg prose-p:leading-[2.5] prose-p:mb-16
            prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-li:text-lg prose-li:mb-16 prose-li:leading-[2.5] marker:text-purple-500
            prose-ul:my-16 prose-ol:my-16
            prose-hr:my-32 prose-hr:border-gray-200 dark:prose-hr:border-gray-800
            prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:bg-purple-50/50 dark:prose-blockquote:bg-purple-900/10 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:mb-16
            prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-xl prose-pre:mb-16 
            ${isRTL ? 'text-right' : 'text-left'}`}>
                            <MDXRemote
                                source={content}
                                components={{
                                    h2: (props) => <h2 className="text-4xl font-bold mt-24 mb-16" {...props} />,
                                    hr: (props) => <hr className="my-24 border-gray-200 dark:border-gray-800" {...props} />,
                                    ol: (props) => <ol className="list-decimal pl-6 mt-12 mb-12" {...props} />,
                                    a: ({ href, children, ...props }) => {
                                        const isExternal = href?.startsWith('http');
                                        return (
                                            <a
                                                href={href}
                                                className="animated-link text-purple-600 dark:text-purple-400 font-medium inline-flex items-center group"
                                                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                                {...props}
                                            >
                                                <span className="relative">
                                                    {children}
                                                </span>
                                                {isExternal && (
                                                    <svg
                                                        className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                )}
                                            </a>
                                        );
                                    },
                                }}
                                options={{
                                    mdxOptions: {
                                        rehypePlugins: [rehypeHighlight]
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Bottom Ad Unit */}
                    <div className="mt-8">
                        <AdSenseAd slot="5462294096" />
                    </div>
                </article>

                {/* Related Posts Section */}
                {relatedPosts.length > 0 && (
                    <section className={`mt-16 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
                            {isRTL ? 'مقالات ذات صلة' : 'Related Posts'}
                        </h2>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {relatedPosts.map((post) => (
                                <ArticleCard key={post.slug} post={post} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer: Category Link and Back Button */}
                <div className={`mt-12 flex flex-col items-center gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {category && (
                        <div>
                            <Link
                                href={getCategoryUrl(category)}
                                className="inline-block text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-200/70 dark:hover:bg-blue-900/40 transition-colors"
                            >
                                {category}
                            </Link>
                        </div>
                    )}
                    <Link
                        href={`/blog?lang=${lang}`}
                        className={`inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 group transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                        <svg
                            className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${isRTL ? 'ml-2 rotate-180 group-hover:translate-x-1' : 'mr-2'}`}
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
                        {isRTL ? 'العودة للمدونة' : 'Back to Blog'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
