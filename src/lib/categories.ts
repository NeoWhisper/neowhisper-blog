// src/lib/categories.ts
// This file defines a consistent, locale‑aware mapping for all category slugs.
//
// Each category has a stable ASCII slug (used in URLs and for post filtering),
// an English name (used as the default display value), and optional
// localized names for Japanese (nameJa) and Arabic (nameAr).
//
// The mapping is intentionally minimal – just the categories that currently
// exist in the blog.  If a new category is added, add an entry here.

export interface Category {
  /**
   * The stable ASCII slug that appears in the URL.
   */
  slug: string;
  /**
   * English display name.
   */
  nameEn: string;
  /**
   * Japanese display name (optional).  When the current locale is "ja",
   * this value is used in the UI.
   */
  nameJa?: string;
  /**
   * Arabic display name (optional).  When the current locale is "ar",
   * this value is used in the UI.
   */
  nameAr?: string;
}

export const categories: Category[] = [
  {
    slug: "software-development",
    nameEn: "Software Development",
  },
  {
    slug: "game-development",
    nameEn: "Game Development",
  },
  {
    slug: "translation",
    nameEn: "Translation",
  },
  {
    slug: "next.js",
    nameEn: "Next.js Tutorials",
  },
  {
    slug: "typescript",
    nameEn: "TypeScript",
  },
  {
    slug: "tech-tips",
    nameEn: "Tech Tips",
  },
  {
    slug: "art-design",
    nameEn: "Art & Design",
    nameJa: "アート＆デザイン",
    nameAr: "الفن والتصميم",
  },
];

export function buildCategorySlug(name: string) {
  const lowered = name.toLowerCase();

  // Prefer the canonical mapping when possible (matches any locale name)
  const match = categories.find((c) =>
    [c.nameEn, c.nameJa, c.nameAr].some((n) => n && n.toLowerCase() === lowered)
  );
  if (match) return match.slug;

  if (name === 'Next.js') return 'next.js';

  // Replace full-width and normal ampersands with "and", strip punctuation,
  // then collapse whitespace into hyphens.
  return name
    .replace(/[＆&]/g, 'and')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
