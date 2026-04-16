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

// Emits noindex and excludes from sitemap if word count is below this threshold.
// We enforce a hard floor of 450 words, but prefer the env-configured threshold.
export const EFFECTIVE_BRIEF_NOINDEX_THRESHOLD = Math.max(
  450,
  Number.parseInt(process.env.BRIEF_NOINDEX_MIN_WORDS ?? "800", 10)
);

/**
 * Estimates the word count of a post, stripping MDX/code/HTML before counting.
 * For Japanese slugs, uses character-based estimation (≈ 2.5 chars / word-equivalent).
 */
export function countPostWords(slug: string, content: string): number {
  // Strip YAML frontmatter before counting to prevent inflated word counts
  const contentWithoutFrontmatter = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");

  const cleanContent = contentWithoutFrontmatter
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
  
  // Business rule: sub-threshold AI trend brief posts should not be indexed.
  return wordCount < EFFECTIVE_BRIEF_NOINDEX_THRESHOLD;
}
