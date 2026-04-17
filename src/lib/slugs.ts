/**
 * Shared utility for generating URL-safe and TOC-friendly anchors (slugs).
 * This logic must be kept in sync between the generation scripts and 
 * the frontend React components to ensure and maintain anchor link functionality.
 */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`"'’“”]/g, "") // Remove common quotes
    .replace(/[^\p{L}\p{N}\s-]/gu, " ") // Replace non-letters/numbers (including Unicode) with space
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim()
    .replace(/\s/g, "-") // Space to hyphen
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, "") || "section"; // Trim dashes and fallback
}
