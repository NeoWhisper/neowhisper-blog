/**
 * Shared utility: low-value AI brief post detection.
 *
 * Used by:
 *  - src/app/(site)/blog/[slug]/page.tsx  → emit noindex for sub-threshold posts
 *  - src/app/sitemap.ts                   → exclude sub-threshold posts from sitemap
 *
 * Configuration via environment variables:
 *  - BRIEF_NOINDEX_ENABLED: Set to "false" to disable low-value brief noindexing (default: true)
 *  - BRIEF_NOINDEX_MIN_WORDS: Minimum word count threshold (default: 900, floor: 600)
 */

const DEFAULT_BRIEF_NOINDEX_MIN_WORDS = 900;
const BRIEF_NOINDEX_MIN_WORDS_FLOOR = 600;
const GENERIC_BRIEF_COVER_IMAGE = "/og-image.jpg";

// Feature flag: enabled by default while the AdSense remediation is active.
// Set BRIEF_NOINDEX_ENABLED=false only after briefs have distinctive images,
// source-grounded original analysis, and enough depth for policy review.
export const BRIEF_NOINDEX_ENABLED =
  process.env.BRIEF_NOINDEX_ENABLED !== "false";

// Emits noindex and excludes from sitemap if word count is below this threshold.
export const EFFECTIVE_BRIEF_NOINDEX_THRESHOLD = Math.max(
  BRIEF_NOINDEX_MIN_WORDS_FLOOR,
  Number.parseInt(
    process.env.BRIEF_NOINDEX_MIN_WORDS ??
      String(DEFAULT_BRIEF_NOINDEX_MIN_WORDS),
    10,
  ),
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
 * When disabled, all posts are considered indexable regardless of length.
 */
export function isLowValueBriefPost(
  slug: string,
  content: string,
  coverImage?: string | null,
): boolean {
  if (!BRIEF_NOINDEX_ENABLED) return false;

  const isBrief = /(^|-)ai-(it-)?trend-brief-/.test(slug);
  if (!isBrief) return false;

  if (coverImage === GENERIC_BRIEF_COVER_IMAGE) return true;

  const wordCount = countPostWords(slug, content);
  // Business rule: sub-threshold AI trend brief posts should not be indexed.
  return wordCount < EFFECTIVE_BRIEF_NOINDEX_THRESHOLD;
}
