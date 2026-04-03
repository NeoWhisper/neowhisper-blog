#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { categories } from "./config/categories.js";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

// Build a map from any language name to the canonical slug
const categoryNameToSlug = new Map<string, string>();
for (const cat of categories) {
  categoryNameToSlug.set(cat.nameEn, cat.slug);
  categoryNameToSlug.set(cat.nameJa, cat.slug);
  categoryNameToSlug.set(cat.nameAr, cat.slug);
}

// Add aliases for commonly used shorter names
categoryNameToSlug.set("Next.js", "next.js");

function getBaseSlug(filename: string): string {
  return filename
    .replace(/\.mdx$/, "")
    .replace(/-ar$/, "")
    .replace(/-ja$/, "");
}

function parseCategoryFromFrontmatter(content: string): string | null {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;
  const frontmatter = match[1];
  const categoryMatch = frontmatter.match(/^category:\s*"?([^"\n]+)"?/m);
  return categoryMatch?.[1]?.trim() ?? null;
}

function countPostsPerCategory(): Map<string, number> {
  const counts = new Map<string, number>();
  const seenBaseSlugs = new Set<string>();

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const baseSlug = getBaseSlug(file);
    if (seenBaseSlugs.has(baseSlug)) continue;
    seenBaseSlugs.add(baseSlug);

    const content = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const categoryName = parseCategoryFromFrontmatter(content);

    if (categoryName) {
      // Map any language name to the canonical slug
      const slug = categoryNameToSlug.get(categoryName) ?? categoryName;
      const current = counts.get(slug) ?? 0;
      counts.set(slug, current + 1);
    }
  }

  return counts;
}

function main(): void {
  const postCounts = countPostsPerCategory();

  console.log("Categories (with post counts):");
  console.log("-".repeat(35));

  for (const cat of categories) {
    const count = postCounts.get(cat.slug) ?? 0;
    const displayCount = count > 0 ? String(count) : "-";
    console.log(`${cat.slug.padEnd(26)} ${displayCount.padStart(4)}`);
  }

  console.log("-".repeat(35));
  const totalPosts = Array.from(postCounts.values()).reduce((a, b) => a + b, 0);
  console.log(`Total categories: ${categories.length}`);
  console.log(`Total posts: ${totalPosts}`);
}

main();
