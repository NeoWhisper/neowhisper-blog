import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

// Define the path to your content directory
const postsDirectory = path.join(process.cwd(), "src/content/posts");

import { Post } from "@/types";

// Function to retrieve all posts, sorted by date
export function getPosts(): Post[] {
    // Create directory if it doesn't exist to prevent errors
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);

    const allPostsData = fileNames.map((fileName) => {
        // Remove ".mdx" from file name to get id
        const slug = fileName.replace(/\.mdx$/, "");

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");

        // Use gray-matter to parse the post metadata section
        const { data, content } = matter(fileContents);

        const stats = readingTime(content);

        return {
            slug,
            title: data.title || "Untitled Post",
            // Convert date to string to avoid serialization issues
            date: data.date
                ? new Date(data.date).toISOString()
                : new Date().toISOString(),
            excerpt: data.excerpt || "",
            coverImage: data.coverImage || null,
            category: data.category || null,
            readTime: stats.text,
            content,
        } as Post;
    });

    // Sort posts by date (newest first)
    return allPostsData.sort((a, b) => {
        return a.date < b.date ? 1 : -1;
    });
}

// Function to retrieve a single post by slug (for the next step)
export function getPostBySlug(slug: string): Post | null {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const stats = readingTime(content);

    return {
        slug,
        title: data.title,
        date: data.date
            ? new Date(data.date).toISOString()
            : new Date().toISOString(),
        excerpt: data.excerpt || "",
        coverImage: data.coverImage || null,
        category: data.category || null,
        readTime: stats.text,
        content,
    } as Post;
}

// Helper function to get the base slug (without language suffix)
export function getBaseSlug(slug: string): string {
    return slug.replace(/(-ar|-ja)$/, '');
}

// Helper function to get all language variants of a post slug
export function getLanguageVariants(baseSlug: string): { lang: string; slug: string }[] {
    const variants = [
        { lang: 'en', slug: baseSlug },
        { lang: 'ja', slug: `${baseSlug}-ja` },
        { lang: 'ar', slug: `${baseSlug}-ar` },
    ];

    // Filter to only include variants that actually exist
    return variants.filter((variant) => {
        const fullPath = path.join(postsDirectory, `${variant.slug}.mdx`);
        return fs.existsSync(fullPath);
    });
}

// Helper function to determine the language of a post from its slug
export function getPostLanguage(slug: string): string {
    if (slug.endsWith('-ar')) return 'ar';
    if (slug.endsWith('-ja')) return 'ja';
    return 'en';
}

// Function to get related posts (same category, same language, excluding current post)
export function getRelatedPosts(currentSlug: string, limit: number = 3): Post[] {
    const currentPost = getPostBySlug(currentSlug);
    
    if (!currentPost || !currentPost.category) {
        return [];
    }

    const currentLanguage = getPostLanguage(currentSlug);
    const allPosts = getPosts();

    // Filter posts by same category and language, exclude current post
    const related = allPosts
        .filter((post) => {
            const postLanguage = getPostLanguage(post.slug);
            return (
                post.slug !== currentSlug &&
                post.category === currentPost.category &&
                postLanguage === currentLanguage
            );
        })
        .slice(0, limit);

    return related;
}
