export const MAX_TOKENS_PER_RUN = 200000;
export const DEFAULT_GENERATION_MAX_TOKENS = 6500;
export const JSON_REPAIR_MAX_ATTEMPTS = 3;
export const MODEL_FETCH_RETRY_ATTEMPTS = 3;
export const MODEL_FETCH_RETRY_DELAY_MS = 1500;

export const TARGET_WORD_COUNT = 1100;
export const MIN_WORDS_THRESHOLD = 900;
export const SECTION_RETRY_LIMIT = 2;
export const EXPANSION_RETRY_LIMIT = 2;

export const LANGUAGE_ORDER = ["en", "ja", "ar"] as const;
export type LanguageCode = (typeof LANGUAGE_ORDER)[number];
export type CategoryNameKey = "nameEn" | "nameJa" | "nameAr";

export const ARTICLE_PATTERNS = ["brief", "tutorial", "analysis"] as const;
export type ArticlePattern = (typeof ARTICLE_PATTERNS)[number];

export const OUTLINE_TEMPLATES: Record<
  ArticlePattern,
  { requiredIds: string[]; description: string }
> = {
  brief: {
    requiredIds: [
      "tldr",
      "intro",
      "(3-4 trend-*)",
      "highlights",
      "closing",
      "table",
    ],
    description: "News brief: TL;DR → Hook → Trends → Highlights → Takeaways",
  },
  tutorial: {
    requiredIds: [
      "intro",
      "problem",
      "solution",
      "steps",
      "examples",
      "troubleshooting",
      "closing",
    ],
    description: "Tutorial: Problem → Solution → Steps → Examples",
  },
  analysis: {
    requiredIds: [
      "intro",
      "context",
      "comparison",
      "tradeoffs",
      "recommendations",
      "closing",
    ],
    description:
      "Deep analysis: Context → Comparison → Trade-offs → Recommendations",
  },
};

export type LanguageLabel = {
  tocHeading: string;
  highlightsHeading: string;
  referencesHeading: string;
  categoryNameKey: CategoryNameKey;
  fileSuffix: string;
};

export const LANGUAGE_LABELS: Record<LanguageCode, LanguageLabel> = {
  en: {
    tocHeading: "## Table of Contents",
    highlightsHeading: "Key Highlights",
    referencesHeading: "## References",
    categoryNameKey: "nameEn",
    fileSuffix: "",
  },
  ja: {
    tocHeading: "## 目次",
    highlightsHeading: "主なハイライト",
    referencesHeading: "## 参考リンク",
    categoryNameKey: "nameJa",
    fileSuffix: "-ja",
  },
  ar: {
    tocHeading: "## المحتويات",
    highlightsHeading: "أبرز المميزات",
    referencesHeading: "## المراجع",
    categoryNameKey: "nameAr",
    fileSuffix: "-ar",
  },
};

export const SYSTEM_RULES = `
You are the senior tech writer for NeoWhisper, a Tokyo-based AI and IT studio.
Audience: Software engineers, ML engineers, technical PMs, founders. They care about feasibility, integration patterns, trade-offs, and real business impact.
Tone: Professional, confident, senior peer, helpful, optimism-tinged, NO corporate clichés.
Structure: Open with a specific vignette (3-8 sentences) before revealing the tool. Include a mandatory "Reality check" section covering risks, failure modes, and when NOT to use it.

CRITICAL OUTPUT RULES:
- When asked for JSON, output ONLY valid JSON. No markdown code blocks, no explanations, no extra text.
- JSON must start with { and end with }. Never wrap JSON in triple backticks.
- All string values must use double quotes and have proper escape sequences.
- Required fields must be present. Do not omit any fields specified in the schema.

AdSense Constraints: Write for humans. Prioritize original, substantial, and factual usefulness. Avoid thin filler.
Truthfulness Constraints:
- Do not fabricate facts, pricing, benchmarks, latency, scale limits, or customer outcomes.
- Do not invent exact numbers unless explicitly present in the provided sources.
- If exact numbers are unavailable, use qualitative phrasing and clearly mark estimates/hypotheses.
- Distinguish clearly between what is currently available vs roadmap/speculative ideas.

STYLE CONSTRAINTS:
- NO "Imagine..." framing paragraphs - they are repetitive and add no value
- NO "rapidly evolving landscape", "cutting-edge", "groundbreaking" marketing speak
- Get straight to the point in your opening paragraphs
- Each section must be substantive and unique - no repetition
- TL;DR is ONE section only - do not repeat it later
- Model comparison tables should be meaningful, not just listing tools

TL;DR Section Format (when section id is "tldr"):
- Create a "TL;DR" (or localized equivalent) section with 3-4 ultra-concise bullet points
- Use emojis for each point (e.g., ⚡, 🔍, 🎯, 🚀)
- Summarize the most critical takeaways in one sentence each
- NO framing paragraphs before or after

Highlights Section Format (when section id is "highlights"):
- Create a "Key Features" or "Key Highlights" section with 4-6 bullet points
- Format: "• [Feature name]: [Brief description with practical benefit]"
- Use emojis where appropriate (⚡ 🌍 🔒 🛠️ 📊 etc.)
- Include: size/scale options, language support, key capabilities, licensing/accessibility
- End with the most notable differentiator
- Keep descriptions concise but informative

Closing Section Format (when section id is "closing" or "conclusion"):
- Add a concise "What this means for your team" section with 2-3 actionable bullets
- Be specific and practical - no vague generalizations
- Focus on concrete next steps, not abstract concepts
`;

export const CONTENT_CONSTRAINTS = `
### STRICT CONSTRAINTS:
- NO "Imagine..." framing paragraphs - get straight to the point
- NO "The landscape is evolving" or similar generic intros
- NO repetitive "What this means for your team" sections
- NO "rapidly evolving", "cutting-edge", "groundbreaking" marketing speak
- Be specific and concrete - avoid vague statements
- Each section must add unique value, not repeat previous sections
- NO generic "TL;DR" followed by near-identical content later
- NO model comparison tables that just list the same tools repeatedly
- Focus on substantive analysis, not promotional framing
- If covering the same topic as recent posts, find a genuinely different angle
`;
