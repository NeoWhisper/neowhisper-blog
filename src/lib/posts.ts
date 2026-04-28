/**
 * NeoWhisper - Modern Tech Blog
 * Copyright (c) 2026 Yousif Alqadi
 * Licensed under the MIT License
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

// Define the path to your content directory
const postsDirectory = path.join(process.cwd(), "src/content/posts");

import { Post } from "@/types";
import { buildCategorySlug } from "@/lib/categories";

function sanitizeMdxContent(content: unknown): string {
  return String(content ?? "").replace(/<(?=\s*\d)/g, "&lt;");
}

function safeFrontmatterString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  if (!normalized || normalized === "[object Object]") return fallback;
  return normalized;
}

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
      title: safeFrontmatterString(data.title, "Untitled Post"),
      // Convert date to string to avoid serialization issues
      date: data.date
        ? new Date(data.date).toISOString()
        : new Date().toISOString(),
      excerpt: safeFrontmatterString(data.excerpt),
      coverImage: data.coverImage || null,
      category: safeFrontmatterString(data.category) || null,
      readTime: stats.text,
      content: sanitizeMdxContent(content),
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
    title: safeFrontmatterString(data.title, "Untitled Post"),
    date: data.date
      ? new Date(data.date).toISOString()
      : new Date().toISOString(),
    excerpt: safeFrontmatterString(data.excerpt),
    coverImage: data.coverImage || null,
    category: safeFrontmatterString(data.category) || null,
    readTime: stats.text,
    content: sanitizeMdxContent(content),
  } as Post;
}

// Helper function to get the base slug (without language suffix)
export function getBaseSlug(slug: string): string {
  return slug.replace(/(-ar|-ja)$/, "");
}

// Helper function to get all language variants of a post slug
export function getLanguageVariants(
  baseSlug: string,
): { lang: string; slug: string }[] {
  const variants = [
    { lang: "en", slug: baseSlug },
    { lang: "ja", slug: `${baseSlug}-ja` },
    { lang: "ar", slug: `${baseSlug}-ar` },
  ];

  // Filter to only include variants that actually exist
  return variants.filter((variant) => {
    const fullPath = path.join(postsDirectory, `${variant.slug}.mdx`);
    return fs.existsSync(fullPath);
  });
}

// Helper function to determine the language of a post from its slug
export function getPostLanguage(slug: string): string {
  if (slug.endsWith("-ar")) return "ar";
  if (slug.endsWith("-ja")) return "ja";
  return "en";
}

// Function to get previous and next posts (by date, same language)
export function getPrevNextPosts(currentSlug: string): {
  prev: Post | null;
  next: Post | null;
} {
  const allPosts = getPosts();
  const currentPost = getPostBySlug(currentSlug);

  if (!currentPost) {
    return { prev: null, next: null };
  }

  const currentLanguage = getPostLanguage(currentSlug);

  // Filter posts by same language (include current post to find its position)
  const sameLangPosts = allPosts.filter((post) => {
    const postLanguage = getPostLanguage(post.slug);
    return postLanguage === currentLanguage;
  });

  // Sort by date (newest first)
  const sortedPosts = sameLangPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Find current post index in sorted list
  const currentIndex = sortedPosts.findIndex(
    (post) => post.slug === currentSlug,
  );

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  // Prev post is newer (index - 1)
  const prev = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;

  // Next post is older (index + 1)
  const next =
    currentIndex < sortedPosts.length - 1
      ? sortedPosts[currentIndex + 1]
      : null;

  return { prev, next };
}

// Function to get related posts (same category, same language, excluding current post)
export function getRelatedPosts(
  currentSlug: string,
  limit: number = 3,
): Post[] {
  const currentPost = getPostBySlug(currentSlug);

  if (!currentPost || !currentPost.category) {
    return [];
  }

  const currentLanguage = getPostLanguage(currentSlug);
  const currentCategorySlug = buildCategorySlug(currentPost.category);
  const allPosts = getPosts();

  // Filter posts by same category and language, exclude current post
  const related = allPosts
    .filter((post) => {
      const postLanguage = getPostLanguage(post.slug);
      const postCategorySlug = post.category
        ? buildCategorySlug(post.category)
        : null;
      return (
        post.slug !== currentSlug &&
        postCategorySlug === currentCategorySlug &&
        postLanguage === currentLanguage
      );
    })
    .slice(0, limit);

  return related;
}
