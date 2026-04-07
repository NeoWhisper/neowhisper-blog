const METADATA_OBJECT_KEYS = ["result", "text", "excerpt", "title"] as const;

export function sanitizeGeneratedMarkdown(markdown: string): string {
  return String(markdown ?? "")
    // MDX interprets "<50ms" style tokens as JSX starts and can crash render.
    .replace(/<(?=\s*\d)/g, "&lt;");
}

const collapseWhitespace = (text: string): string =>
  text.replace(/\s+/g, " ").trim();

export function normalizeExcerptText(value: unknown, fallback = ""): string {
  const normalized = normalizeMetadataText(value, fallback)
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");

  const singleLine = collapseWhitespace(normalized);
  return singleLine.length > 260 ? `${singleLine.slice(0, 257)}...` : singleLine;
}

export function normalizeMetadataText(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    const normalized = value.trim();
    if (!normalized || normalized === "[object Object]") return fallback;
    return normalized;
  }

  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    for (const key of METADATA_OBJECT_KEYS) {
      const candidate = objectValue[key];
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
    return fallback;
  }

  return fallback;
}

const contentSafety = {
  sanitizeGeneratedMarkdown,
  normalizeMetadataText,
  normalizeExcerptText,
};

export default contentSafety;
