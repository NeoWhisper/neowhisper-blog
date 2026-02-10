import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";
import { categories as canonicalCategories } from "@/lib/categories";

const baseUrl = "https://www.neowhisper.net";

// Helper function to create a slug from a category name
// Normalise category names to canonical slugs. Prefer the canonical mapping
// when a localized display name matches; otherwise use a safe fallback that
// mirrors the logic used in the category page (replace ampersands, strip
// punctuation, collapse spaces to hyphens).
function createCategorySlug(name: string): string {
  const lowered = name.toLowerCase();

  const match = canonicalCategories.find((c) =>
    [c.nameEn, c.nameJa, c.nameAr].some(
      (n) => n && n.toLowerCase() === lowered,
    ),
  );
  if (match) return match.slug;

  if (name === "Next.js") return "next.js";

  return name
    .replace(/[＆&]/g, "and")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();

  // Generate blog post URLs
  const blogUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Build a union of category slugs derived from posts and the canonical
  // categories mapping. We intentionally only include categories that
  // actually have posts to avoid indexing thin/empty category pages.
  const postCategorySlugs = Array.from(
    new Set(
      posts
        .map((post) => post.category)
        .filter(Boolean)
        .map((c) => createCategorySlug(c!)),
    ),
  );
  const categoryUrls = postCategorySlugs.map((slug) => ({
    url: `${baseUrl}/category/${encodeURIComponent(slug)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...blogUrls,
    ...categoryUrls,
  ];
}
