import { ReactNode } from "react";
import { slugify } from "./slugs";

/**
 * Flattens React nodes into a single string for slugification.
 */
export function flattenText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (node && typeof node === "object" && "props" in node) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return flattenText((node as any).props?.children);
  }
  return "";
}

/**
 * Converts a heading's React contents into a URL-safe anchor ID.
 */
export function headingToId(value: ReactNode): string {
  return slugify(flattenText(value));
}

/**
 * Strips the leading duplicate title/heading artifacts that the AI sometimes generates.
 * This ensures the post body starts with unique content and complies with AdSense single-H1 rules.
 */
export function stripLeadingDuplicateTitleHeading(
  mdxSource: string,
  title: string
): string {
  const escapedTitle = title
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const cleaned = mdxSource
    // Remove exact "# Title"
    .replace(new RegExp(`^#\\s+${escapedTitle}\\s*\\n+`, "i"), "")
    // Remove "TITLE: Article Title"
    .replace(new RegExp(`^TITLE:\\s*${escapedTitle}\\s*\\n+`, "i"), "")
    // Remove generic "TITLE AI IT Trends..." artifact
    .replace(/^TITLE\s+AI\s+IT\s+Trends.*?\n+/i, "");

  return cleaned;
}
