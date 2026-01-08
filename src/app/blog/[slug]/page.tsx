import { notFound } from 'next/navigation';
import { getPostBySlug, getPosts } from '@/lib/posts';
import { MDXRemote } from 'next-mdx-remote/rsc';

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
        <article className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Post Header */}
                <header className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                        {post.title}
                    </h1>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </time>
                    </div>
                </header>

                {/* Post Content */}
                <div className="px-6 py-8 prose prose-lg dark:prose-invert max-w-none">
                    {/* MDXRemote handles the rendering of the markdown string */}
                    <MDXRemote source={post.content} />
                </div>
            </div>
        </article>
    );
}
