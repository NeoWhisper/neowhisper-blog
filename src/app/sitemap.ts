import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/posts';

const baseUrl = 'https://www.neowhisper.net';

// Helper function to create a slug from a category name
function createCategorySlug(category: string): string {
    if (category === 'Next.js') {
        return 'next.js';
    }
    return category.toLowerCase().replace(/\s+/g, '-');
}

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
            slug: createCategorySlug(category),
        }));

    // Generate category URLs - URL-encode the slug to handle special characters
    const categoryUrls = uniqueCategories.map((category) => ({
        url: `${baseUrl}/category/${encodeURIComponent(category.slug)}`,
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
