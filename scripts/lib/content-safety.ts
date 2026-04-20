const METADATA_OBJECT_KEYS = ["result", "text", "excerpt", "title"] as const;

export function sanitizeGeneratedMarkdown(markdown: string): string {
  return (
    String(markdown ?? "")
      // MDX interprets "<50ms" style tokens as JSX starts and can crash render.
      .replace(/<(?=\s*\d)/g, "&lt;")
  );
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
  return singleLine.length > 260
    ? `${singleLine.slice(0, 257)}...`
    : singleLine;
}

export function normalizeMetadataText(value: unknown, fallback = ""): string {
  // Guard: String type (most common case)
  if (typeof value === "string") {
    const normalized = value.trim();
    const isInvalid = !normalized || normalized === "[object Object]";
    return isInvalid ? fallback : normalized;
  }

  // Guard: Non-object types
  if (!value || typeof value !== "object") return fallback;

  // Functional search through metadata keys (data over control flow)
  const objectValue = value as Record<string, unknown>;
  const validCandidate = METADATA_OBJECT_KEYS.map(
    (key) => objectValue[key],
  ).find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  );

  return validCandidate?.trim() ?? fallback;
}

const contentSafety = {
  sanitizeGeneratedMarkdown,
  normalizeMetadataText,
  normalizeExcerptText,
};

export default contentSafety;
