/**
 * Shared utility: low-value AI brief post detection.
 *
 * Used by:
 *  - src/app/(site)/blog/[slug]/page.tsx  → emit noindex for sub-threshold posts
 *  - src/app/sitemap.ts                   → exclude sub-threshold posts from sitemap
 *
 * Configuration via environment variables:
 *  - BRIEF_NOINDEX_ENABLED: Set to "true" to enable noindex for low-value briefs (default: false)
 *  - BRIEF_NOINDEX_MIN_WORDS: Minimum word count threshold (default: 300, floor: 150)
 */

// Feature flag: Set to "true" to enable noindex for sub-threshold brief posts.
// Default is false to ensure all posts are indexed for AdSense compliance.
export const BRIEF_NOINDEX_ENABLED =
  process.env.BRIEF_NOINDEX_ENABLED === "true";

// Emits noindex and excludes from sitemap if word count is below this threshold.
// Lowered default to 300 words; enforce hard floor of 150 words minimum.
export const EFFECTIVE_BRIEF_NOINDEX_THRESHOLD = Math.max(
  150,
  Number.parseInt(process.env.BRIEF_NOINDEX_MIN_WORDS ?? "300", 10),
);

/**
 * Estimates the word count of a post, stripping MDX/code/HTML before counting.
 * For Japanese slugs, uses character-based estimation (≈ 2.5 chars / word-equivalent).
 */
export function countPostWords(slug: string, content: string): number {
  // Strip YAML frontmatter before counting to prevent inflated word counts
  const contentWithoutFrontmatter = content.replace(
    /^---\r?\n[\s\S]*?\r?\n---\r?\n/,
    "",
  );

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
 *
 * NOTE: This function respects the BRIEF_NOINDEX_ENABLED feature flag.
 * When disabled (default), all posts are considered indexable regardless of length.
 */
export function isLowValueBriefPost(slug: string, content: string): boolean {
  // Feature flag: disabled by default to ensure AdSense compliance
  if (!BRIEF_NOINDEX_ENABLED) return false;

  const isBrief = /(^|-)ai-(it-)?trend-brief-/.test(slug);
  if (!isBrief) return false;

  const wordCount = countPostWords(slug, content);

  // Business rule: sub-threshold AI trend brief posts should not be indexed.
  return wordCount < EFFECTIVE_BRIEF_NOINDEX_THRESHOLD;
}
