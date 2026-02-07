import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostBySlug, getPosts, getBaseSlug, getLanguageVariants, getRelatedPosts } from '@/lib/posts';
import BlogPostTemplate from '@/components/BlogPostTemplate';

const baseUrl = 'https://www.neowhisper.net';

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

// 2. Generate Metadata with hreflang tags
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        return {};
    }

    const baseSlug = getBaseSlug(slug);
    const languageVariants = getLanguageVariants(baseSlug);

    // Determine current language
    const currentLang = slug.endsWith('-ar') ? 'ar' : slug.endsWith('-ja') ? 'ja' : 'en';

    // Build hreflang alternates
    const languages: Record<string, string> = {};

    languageVariants.forEach((variant) => {
        languages[variant.lang] = `${baseUrl}/blog/${variant.slug}`;
    });

    // Add x-default to the base (English) version if it exists
    const baseVariant = languageVariants.find((v) => v.lang === 'en');
    if (baseVariant) {
        languages['x-default'] = `${baseUrl}/blog/${baseVariant.slug}`;
    }

    return {
        title: post.title,
        description: post.excerpt,
        alternates: {
            languages,
        },
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: post.coverImage ? [post.coverImage] : [],
            locale: currentLang === 'ja' ? 'ja_JP' : currentLang === 'ar' ? 'ar_SA' : 'en_US',
            alternateLocale: languageVariants
                .filter((v) => v.lang !== currentLang)
                .map((v) => (v.lang === 'ja' ? 'ja_JP' : v.lang === 'ar' ? 'ar_SA' : 'en_US')),
        },
    };
}

// 3. The Page Component
export default async function BlogPost({ params }: PageProps) {
    // In Next.js 16, params is a Promise that must be awaited
    const { slug } = await params;

    const post = getPostBySlug(slug);
    const isRTL = slug.endsWith('-ar');
    const lang = slug.endsWith('-ar') ? 'ar' : slug.endsWith('-ja') ? 'ja' : 'en';

    if (!post) {
        notFound();
    }

    const baseSlug = getBaseSlug(slug);
    const languageVariants = getLanguageVariants(baseSlug);
    const availableLanguages = languageVariants.map((v) => v.lang);
    const relatedPosts = getRelatedPosts(slug, 3);

    return (
        <BlogPostTemplate
            title={post.title}
            date={post.date}
            content={post.content}
            coverImage={post.coverImage}
            category={post.category}
            readTime={post.readTime}
            isRTL={isRTL}
            availableLanguages={availableLanguages}
            relatedPosts={relatedPosts}
            lang={lang}
        />
    );
}
