export const MAX_TOKENS_PER_RUN = 200000;
export const DEFAULT_GENERATION_MAX_TOKENS = 6500;
export const JSON_REPAIR_MAX_ATTEMPTS = 3;
export const MODEL_FETCH_RETRY_ATTEMPTS = 3;
export const MODEL_FETCH_RETRY_DELAY_MS = 1500;

export const TARGET_WORD_COUNT = 1100;
export const MIN_WORDS_THRESHOLD = 900;
export const SECTION_RETRY_LIMIT = 2;
export const EXPANSION_RETRY_LIMIT = 2;

export const LANGUAGE_ORDER = ["en", "ja", "ar"];
export const LANGUAGE_LABELS = {
  en: { tocHeading: "## Table of Contents", referencesHeading: "## References", categoryNameKey: "nameEn", fileSuffix: "" },
  ja: { tocHeading: "## 目次", referencesHeading: "## 参考リンク", categoryNameKey: "nameJa", fileSuffix: "-ja" },
  ar: { tocHeading: "## المحتويات", referencesHeading: "## المراجع", categoryNameKey: "nameAr", fileSuffix: "-ar" },
};

export const SYSTEM_RULES = `
You are the senior tech writer for NeoWhisper, a Tokyo-based AI and IT studio.
Tone: Professional, confident, senior peer, helpful, optimism-tinged, NO corporate clichés.
AdSense Constraints: Write for humans. Prioritize original, substantial, and factual usefulness. Avoid thin filler.
`;

export const CONTENT_CONSTRAINTS = `
### DO NOT:
- Use generic titles or buzzwords.
- Produces thin, generic, or filler-heavy AI-sounding content.
- Include corporate clichés or bland "rapidly evolving landscape" intros.
`;
