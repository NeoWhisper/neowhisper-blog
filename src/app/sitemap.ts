import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/posts';

const baseUrl = 'https://www.neowhisper.net';

export default function sitemap(): MetadataRoute.Sitemap {
    const posts = getPosts();

    // Generate blog post URLs
    const blogUrls = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.date ? new Date(post.date) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // Extract unique categories
    const uniqueCategories = Array.from(new Set(posts.map((post) => post.category)))
        .filter((category): category is string => Boolean(category))
        .map((category) => ({
            name: category,
            slug: category === 'Next.js' ? 'next.js' : category.toLowerCase().replace(/ /g, '-'),
        }));

    // Generate category URLs
    const categoryUrls = uniqueCategories.map((category) => ({
        url: `${baseUrl}/category/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        ...blogUrls,
        ...categoryUrls,
    ];
}
