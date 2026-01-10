import { notFound } from 'next/navigation';
import { getPostBySlug, getPosts } from '@/lib/posts';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

// 1. Generate Static Params: Tells Next.js which posts to build at compile time
export async function generateStaticParams() {
    const posts = getPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

// 2. The Page Component
export default async function BlogPost({ params }: PageProps) {
    // In Next.js 15, params is a Promise that must be awaited
    const { slug } = await params;

    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <article className="max-w-3xl mx-auto">
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

                {/* Post Card with Glassmorphism */}
                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-3xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    {/* Post Header */}
                    <header className="px-6 sm:px-12 py-8 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
                            {post.title}
                        </h1>
                        <time
                            dateTime={post.date}
                            className="inline-block text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/20 px-4 py-2 rounded-full border border-purple-200/50 dark:border-purple-800/30"
                        >
                            {new Date(post.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </time>
                    </header>

                    {/* Post Content */}
                    <div className="px-6 sm:px-12 py-8 prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline">
                        {/* MDXRemote handles the rendering of the markdown string */}
                        <MDXRemote source={post.content} />
                    </div>
                </div>

                {/* Bottom Back Button (for long posts) */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 group transition-colors"
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
                </div>
            </article>
        </div>
    );
}
