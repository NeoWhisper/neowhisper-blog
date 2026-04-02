const METADATA_OBJECT_KEYS = ["result", "text", "excerpt", "title"] as const;

export function sanitizeGeneratedMarkdown(markdown: string): string {
  return String(markdown ?? "")
    // MDX interprets "<50ms" style tokens as JSX starts and can crash render.
    .replace(/<(?=\s*\d)/g, "&lt;");
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
};

export default contentSafety;
