import { getPosts } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';
import { categories, buildCategorySlug } from '@/lib/categories';
import Link from 'next/link';
import { normalizeLang } from '@/lib/i18n';

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ lang?: string }>;
}

/**
 * Generate static params for every category that actually appears in
 * any post (the `filter(Boolean)` removes the null/undefined ones).
 */
export async function generateStaticParams() {
    const posts = getPosts();
    const categories = Array.from(
        new Set(posts.map((p) => p.category).filter(Boolean))
    );
    return categories.map((c) => ({
        slug: encodeURIComponent(buildCategorySlug(c!)),
    }));
}

/**
 * A lookup for pretty names that aren’t just `dash‑case` of the slug.
 * Anything not present will be auto‑capitalised.
 */
// NOTE: pretty names are derived from the canonical `categories` mapping
// below when available. Any unknown slug will be auto-capitalised.

export default async function CategoryPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { lang } = await searchParams;
    const currentLang = normalizeLang(lang);
    const posts = getPosts();
    const decoded = decodeURIComponent(slug);

    // If the incoming slug looks like a non-canonical variant (for
    // example: "art-%26-design" -> "art-&-design"), try to compute the
    // canonical slug from the decoded value. If a canonical category exists
    // and it differs from the requested slug, redirect to the canonical URL
    // (helps with legacy/encoded links and SEO).
    const canonicalCandidate = buildCategorySlug(decoded.replace(/-/g, ' '));
    const hasCanonical = categories.some((c) => c.slug === canonicalCandidate);
    // Only redirect when we actually found a canonical category and the
    // requested slug isn't already the canonical one.
    if (hasCanonical && canonicalCandidate !== decoded) {
        // `redirect` is a synchronous server helper from `next/navigation`.
        // Import it lazily here to keep top-of-file imports tidy.
        const { redirect } = await import('next/navigation');
        redirect(`/category/${canonicalCandidate}`);
    }

    /* ---- filter posts that belong to this category ---- */
    const matches = (p: ReturnType<typeof getPosts>[0]) =>
        p.category && buildCategorySlug(p.category) === decoded;

    const filtered = posts.filter(matches);

    /* ---- pick a human‑readable title ---- */
    const canonical = categories.find((c) => c.slug === decoded);
    const title =
        filtered[0]?.category ?? canonical?.nameEn ??
        decoded
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

    /* ---- UI ---- */
    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900">
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <Link href={`/blog?lang=${currentLang}`} className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-8 group">
                    <svg
                        className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Blog
                </Link>

                <header className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-4">
                        {title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        {filtered.length} {filtered.length === 1 ? 'article' : 'articles'} in this category
                    </p>
                </header>

                {filtered.length > 0 ? (
                    <div className="grid gap-8">
                        {filtered.map((p) => (
                            <ArticleCard key={p.slug} post={p} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                            No articles found in this category yet.
                        </p>
                        <p className="text-sm text-gray-400">
                            Check back soon for new content about {title}!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
