import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { formatDate } from '@/lib/utils';
import { buildCategorySlug } from '@/lib/categories';
import { normalizeLang } from '@/lib/i18n';

const categoryColors: Record<string, string> = {
    'Next.js': 'bg-black text-white',
    'React': 'bg-blue-500 text-white',
    'TypeScript': 'bg-blue-600 text-white',
    'JavaScript': 'bg-yellow-400 text-black',
    'Web Development': 'bg-green-500 text-white',
    'DevOps': 'bg-purple-500 text-white',
    'Database': 'bg-orange-500 text-white',
    'Tutorial': 'bg-pink-500 text-white',
};

interface ArticleCardProps {
    post: Post;
    lang?: string;
}

export default function ArticleCard({ post, lang }: ArticleCardProps) {
    const currentLang = normalizeLang(lang);
    const isRTL = currentLang === "ar";
    const isSuffixLocalizedSlug = post.slug.endsWith("-ja") || post.slug.endsWith("-ar");
    const shouldUseLangQuery = Boolean(lang && lang !== "en" && !isSuffixLocalizedSlug);
    const postHref = `/blog/${encodeURIComponent(post.slug)}${
        shouldUseLangQuery ? `?lang=${encodeURIComponent(currentLang)}` : ""
    }`;
    const readArticleLabel =
        currentLang === "ja"
            ? "記事を読む"
            : currentLang === "ar"
              ? "اقرأ المقال"
              : "Read Article";

    const categoryHref = post.category
        ? `/category/${buildCategorySlug(post.category)}${lang ? `?lang=${encodeURIComponent(currentLang)}` : ''
        }`
        : undefined;

    return (
        <article className="relative overflow-hidden p-8 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.1)] transition-all duration-300 group">
            <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-pink-500/30 transition-colors duration-500" />
            <div className="relative z-10">
                {post.coverImage && (
                    <Link href={postHref} className="block mb-6 -mx-8 -mt-8 relative h-48">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover hover:opacity-90 transition-opacity"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </Link>
                )}

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-4 gap-3">
                    {post.category && (
                        <Link
                            href={categoryHref!}
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[post.category] || 'bg-gray-500 text-white'} hover:opacity-80 transition-opacity`}
                        >
                            {post.category}
                        </Link>
                    )}
                    <time className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full whitespace-nowrap ml-auto">
                        {formatDate(post.date)}
                    </time>
                </div>

                <Link href={postHref}>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                        {post.title}
                    </h2>
                </Link>

                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed line-clamp-3">
                    {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                    <Link
                        href={postHref}
                        className="inline-flex items-center text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                    >
                        {readArticleLabel}
                        <svg
                            className={`w-4 h-4 transition-transform ${
                                isRTL
                                    ? "mr-1 rotate-180 group-hover:-translate-x-1"
                                    : "ml-1 group-hover:translate-x-1"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                    {post.readTime && <span className="text-sm text-gray-500">{post.readTime}</span>}
                </div>
            </div>
        </article>
    );
}
