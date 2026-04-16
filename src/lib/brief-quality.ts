/**
 * Shared utility: low-value AI brief post detection.
 *
 * Used by:
 *  - src/app/(site)/blog/[slug]/page.tsx  → emit noindex for sub-threshold posts
 *  - src/app/sitemap.ts                   → exclude sub-threshold posts from sitemap
 *
 * Raising BRIEF_NOINDEX_MIN_WORDS (default 800) ensures only posts with
 * sufficient depth are indexed and surfaced to AdSense reviewers.
 */

export const BRIEF_NOINDEX_MIN_WORDS = Number.parseInt(
  process.env.BRIEF_NOINDEX_MIN_WORDS ?? "800",
  10,
);

/**
 * Estimates the word count of a post, stripping MDX/code/HTML before counting.
 * For Japanese slugs, uses character-based estimation (≈ 2.5 chars / word-equivalent).
 */
export function countPostWords(slug: string, content: string): number {
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .trim();

  if (slug.endsWith("-ja")) {
    return Math.round(cleanContent.length / 2.5);
  }

  return cleanContent.split(/\s+/).filter(Boolean).length;
}

/**
 * Returns true if the post is a daily AI trend brief AND falls below the
 * minimum word-count threshold for indexing.
 */
export function isLowValueBriefPost(slug: string, content: string): boolean {
  const isBrief = /(^|-)ai-(it-)?trend-brief-/.test(slug);
  if (!isBrief) return false;
  const wordCount = countPostWords(slug, content);
  return wordCount < Math.max(450, BRIEF_NOINDEX_MIN_WORDS);
}
