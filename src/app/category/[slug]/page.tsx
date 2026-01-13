import { getPosts } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

// 1. Generate Static Params for all known categories
export async function generateStaticParams() {
    const posts = getPosts();
    const categories = new Set(posts.map((post) => post.category).filter(Boolean));

    return Array.from(categories).map((category) => ({
        slug: category!.toLowerCase().replace(/\s+/g, '-'),
    }));
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params;
    const posts = getPosts();
    const decodedSlug = decodeURIComponent(slug);

    // Filter posts that match the category slug
    const categoryPosts = posts.filter((post) => {
        if (!post.category) return false;
        const postSlug = post.category.toLowerCase().replace(/\s+/g, '-');
        return postSlug === decodedSlug;
    });

    if (categoryPosts.length === 0) {
        notFound();
    }

    // Get the original category name from the first match for display
    const categoryName = categoryPosts[0].category;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-8 group transition-colors"
                >
                    <svg
                        className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1"
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
                    Back to Home
                </Link>

                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-4">
                        {categoryName}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        {categoryPosts.length} {categoryPosts.length === 1 ? 'article' : 'articles'} in this category
                    </p>
                </header>

                <div className="grid gap-8">
                    {categoryPosts.map((post) => (
                        <ArticleCard key={post.slug} post={post} />
                    ))}
                </div>
            </div>
        </div>
    );
}
