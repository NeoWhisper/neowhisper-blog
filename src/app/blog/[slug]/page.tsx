import { notFound } from 'next/navigation';
import { getPostBySlug, getPosts } from '@/lib/posts';
import BlogPostTemplate from '@/components/BlogPostTemplate';

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
        <BlogPostTemplate
            title={post.title}
            date={post.date}
            content={post.content}
            coverImage={post.coverImage}
            category={post.category}
            readTime={post.readTime}
        />
    );
}
