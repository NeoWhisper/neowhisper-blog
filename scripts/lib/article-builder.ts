#!/usr/bin/env node

/**
 * NeoWhisper Staged Article Builder
 * Generates multi-language technical articles with reduced repetition
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { callAi, parseJsonWithRepair, AiState } from "./ai";
import { startStage, endStage } from "./metrics";
import { ConfigState } from "./config";
import {
  SYSTEM_RULES,
  CONTENT_CONSTRAINTS,
  MAX_TOKENS_PER_RUN,
  LANGUAGE_ORDER,
  MIN_WORDS_THRESHOLD,
  EXPANSION_RETRY_LIMIT,
  OUTLINE_TEMPLATES,
  type LanguageCode,
  type ArticlePattern,
} from "./constants";
import {
  pickCategory,
  computeWordCounts,
  selectSectionsToExpand,
  polishMetadata,
} from "./utils";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");
const RECENT_DAYS = 7;

export type RecentPost = {
  title: string;
  date: string;
  terms: string[];
};

/** Extract topic keywords from recent post titles */
export async function loadRecentTopics(): Promise<Set<string>> {
  try {
    const entries = await fs.readdir(POSTS_DIR);
    const topicTerms = [
      "gemma",
      "gemini",
      "veo",
      "lyria",
      "claude",
      "gpt",
      "llama",
      "deepseek",
      "grok",
      "anthropic",
      "openai",
      "microsoft",
      "meta",
      "nvidia",
      "agent",
      "api",
      "mcp",
    ];

    const topics = new Set<string>();
    for (const entry of entries) {
      if (!entry.endsWith(".mdx")) continue;

      const content = await fs.readFile(path.join(POSTS_DIR, entry), "utf-8");
      const titleMatch = content.match(/^title:\s*"([^"]+)"/m);
      if (titleMatch) {
        const title = titleMatch[1].toLowerCase();
        for (const term of topicTerms) {
          if (title.includes(term)) topics.add(term);
        }
      }
    }
    return topics;
  } catch (e) {
    console.log("[dedup] could not load recent topics:", e);
    return new Set();
  }
}

/** Load recent posts for aggressive cross-post dedup */
export async function loadRecentPosts(): Promise<RecentPost[]> {
  try {
    const entries = await fs.readdir(POSTS_DIR);
    const recent: RecentPost[] = [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RECENT_DAYS);

    for (const entry of entries) {
      if (!entry.endsWith(".mdx")) continue;

      const content = await fs.readFile(path.join(POSTS_DIR, entry), "utf-8");
      const titleMatch = content.match(/^title:\s*"([^"]+)"/m);
      const dateMatch = content.match(/^date:\s*"([^"]+)"/m);
      if (titleMatch && dateMatch) {
        const dt = new Date(dateMatch[1]);
        if (dt >= cutoff) {
          const title = titleMatch[1].toLowerCase();
          const terms = title.split(/[\s\-:]+/).filter((t) => t.length > 3);
          recent.push({ title, date: dateMatch[1], terms });
        }
      }
    }
    return recent;
  } catch (e) {
    console.log("[dedup] could not load recent posts:", e);
    return [];
  }
}

/** Filter sources matching recent topics to avoid repetition */
export function shouldSkipTopic(
  title: string,
  recentTopics: Set<string>,
): boolean {
  const normalized = title.toLowerCase();
  const skipTerms = [
    "gemma",
    "gemini",
    "veo",
    "lyria",
    "flash live",
    "agent skills",
    "mcp",
    "claude",
    "gpt",
    "llama",
    "deepseek",
    "grok",
    "anthropic",
    "openai",
    "microsoft",
    "meta",
    "nvidia",
  ];
  return skipTerms.some(
    (term) => normalized.includes(term) && recentTopics.has(term),
  );
}

/** Aggressive dedup: skip sources too similar to recent posts */
export function shouldSkipSource(
  title: string,
  summary: string,
  recentPosts: RecentPost[],
): boolean {
  const text = `${title} ${summary}`.toLowerCase();
  for (const post of recentPosts) {
    const hits = post.terms.filter((t) => text.includes(t)).length;
    if (hits >= 2) return true;
  }
  return false;
}

type SourceItem = {
  title: string;
  url: string;
  source: string;
  summary?: string;
};

type OutlineSection = {
  id: string;
  title: string;
  intent: string;
  targetWordCount: number;
};

type Outline = {
  title_hint: string;
  slugSuffix: string;
  sections: OutlineSection[];
};

const createFallbackOutline = (
  sources: SourceItem[],
  categorySlug: string,
  dateString: string,
): Outline => {
  const slugSuffix = `${dateString}-${categorySlug}-ai-trends`;
  const titles = sources.slice(0, 3).map((s) => s.title);
  const title_hint =
    titles.length > 0
      ? `AI Trends: ${titles[0].substring(0, 40)}`
      : `AI Trends Brief - ${dateString}`;

  return {
    title_hint,
    slugSuffix,
    sections: [
      {
        id: "intro",
        title: "Introduction",
        intent: `Provide context on recent AI developments for ${dateString}, based on available sources`,
        targetWordCount: 200,
      },
      {
        id: "trends",
        title: "Key Trends",
        intent: `Analyze main AI trends from sources: ${titles.slice(0, 2).join("; ")}`,
        targetWordCount: 400,
      },
      {
        id: "implications",
        title: "What This Means",
        intent:
          "Explain practical implications for developers and organizations",
        targetWordCount: 300,
      },
      {
        id: "conclusion",
        title: "Summary",
        intent: "Brief wrap-up of key takeaways",
        targetWordCount: 150,
      },
    ],
  };
};

type SectionSummary = {
  id: string;
  summary: string;
};

type LanguageBucket = {
  sections: Record<string, string>;
  title?: string;
  excerpt?: string;
};

type StagedContent = {
  en: LanguageBucket;
  ja: LanguageBucket;
  ar: LanguageBucket;
  targetLanguages: LanguageCode[];
};

const asErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

import {
  isObject,
  hasStringProperty,
  hasNumberProperty,
  hasMinLength,
  hasNoDuplicates,
  hasMinSum,
} from "./validation";

// Composed validator for OutlineSection using functional composition (Phase 2)
const validateSection = (value: unknown): value is OutlineSection =>
  isObject(value) &&
  hasStringProperty("id")(value) &&
  hasStringProperty("title")(value) &&
  hasStringProperty("intent")(value) &&
  hasNumberProperty("targetWordCount")(value);

// Composed validator for Outline with predicates (Phase 2)
const validateSectionsArray = (
  value: unknown,
): value is { sections: unknown[] } =>
  isObject(value) &&
  Array.isArray((value as { sections?: unknown[] }).sections);

const validateOutline = (outline: unknown): outline is Outline => {
  if (!validateSectionsArray(outline)) return false;

  const sections = outline.sections;
  const typedSections = sections.filter(validateSection);

  // Predicate composition for array validations
  const hasValidCount = hasMinLength<OutlineSection>(3);
  const hasUniqueIds = hasNoDuplicates<OutlineSection, string>((s) => s.id);
  const hasMinWordCount = hasMinSum<OutlineSection>(
    (s) => s.targetWordCount,
    800,
  );

  return (
    typedSections.length === sections.length &&
    hasValidCount(typedSections) &&
    hasUniqueIds(typedSections) &&
    hasMinWordCount(typedSections)
  );
};

const countStructureElements = (
  text: string,
): { headings: number; lists: number } => ({
  headings: (text.match(/^(##|###)\s/gm) || []).length,
  lists: (text.match(/^[-*]\s/gm) || []).length,
});

const structuresMatch = (
  text1: string,
  text2: string,
  tolerance = 2,
): boolean => {
  const s1 = countStructureElements(text1);
  const s2 = countStructureElements(text2);
  return (
    s1.headings === s2.headings && Math.abs(s1.lists - s2.lists) <= tolerance
  );
};

const LANGUAGE_TRANSLATION_RULES: Partial<Record<LanguageCode, string>> = {
  ja: "Output ONLY Japanese. Do not include English, Chinese, or Arabic sentences except product names and URLs. Translate 'TL;DR' to '要約' and 'Highlights' or 'Key Features' to '主なハイライト' if they appear.",
  ar: "Output ONLY Modern Standard Arabic (الفصحى). Do not include Chinese, Japanese, or English sentences except product names and URLs. Translate 'TL;DR' to 'الخلاصة' and 'Highlights' or 'Key Features' to 'أبرز المميزات' if they appear.",
};

// Pattern lookup table (DeMarco: data over control flow)
const CROSS_LANG_PATTERNS: Record<LanguageCode, RegExp | undefined> = {
  ar: /[\u3040-\u30ff\u4e00-\u9fff]/u, // Arabic text with Japanese chars
  ja: /[\u0600-\u06ff]/u, // Japanese text with Arabic chars
  en: undefined,
};

const hasCrossLanguageArtifacts = (
  lang: LanguageCode,
  text: string,
): boolean => {
  const pattern = CROSS_LANG_PATTERNS[lang];
  return pattern ? pattern.test(text) : false;
};

async function retryOutlineGeneration(
  sources: SourceItem[],
  constraint: string,
  dateString: string,
  categorySlug: string,
  pattern: ArticlePattern,
  recentTopics?: Set<string>,
): Promise<Outline> {
  const attempts = [0, 1, 2];
  const errors: string[] = [];
  const template = OUTLINE_TEMPLATES[pattern];

  for (const attempt of attempts) {
    const retryMsg =
      attempt > 0
        ? "\nThe previous outline was rejected. Ensure every section has id, title, intent, and targetWordCount fields."
        : "";

    const topicConstraint = recentTopics?.size
      ? `\n\nIMPORTANT: Avoid covering topics already discussed recently. Recent topics include: ${[...recentTopics].join(", ")}. Choose fresh angles or different sources.`
      : "";

    const userPrompt = `
Sources:
${sources.map((s, i) => `${i + 1}. [${s.source}] ${s.title}`).join("\n")}

${constraint}${topicConstraint}

Pattern: ${pattern} - ${template.description}
Create a structured JSON outline with these exact fields:
- title_hint (string): Short engaging title
- slugSuffix (string): kebab-case topic name
- sections: Array of objects, each with { id: string, title: string, intent: string, targetWordCount: number }

Required section IDs: ${template.requiredIds.join(", ")}
${retryMsg}

OUTPUT ONLY VALID JSON. No markdown code blocks, no explanations, no extra text.
Start with { and end with }. All strings must use double quotes.

EXAMPLE STRUCTURE:
{"title_hint": "Title", "slugSuffix": "topic-name", "sections": [{"id": "intro", "title": "Introduction", "intent": "Hook", "targetWordCount": 200}]}
`;

    try {
      const raw = await callAi(
        `${SYSTEM_RULES}\nTask: Create a staged article outline for ${dateString} category ${categorySlug}.`,
        userPrompt,
        { responseFormat: { type: "json_object" } },
      );
      const parsed = await parseJsonWithRepair({
        text: raw,
        label: "outline generation",
      });

      if (!validateOutline(parsed)) {
        const outline = parsed as { sections?: unknown[] };

        // Functional validation rules - data over control flow (DeMarco)
        type ValidationRule = {
          readonly check: (o: { sections?: unknown[] }) => boolean;
          readonly message: string | ((o: { sections?: unknown[] }) => string);
        };

        const validationRules: readonly ValidationRule[] = [
          {
            check: (o) => !Array.isArray(o.sections) || o.sections.length < 3,
            message: (o) =>
              `Sections array must have at least 3 items (got ${o.sections?.length ?? 0})`,
          },
          {
            check: (o) =>
              Array.isArray(o.sections) &&
              o.sections.some((s) => !validateSection(s)),
            message: "Missing required section fields",
          },
          {
            check: (o) =>
              Array.isArray(o.sections) &&
              new Set(
                (o.sections as OutlineSection[]).map(
                  (s: OutlineSection) => s.id,
                ),
              ).size !== o.sections.length,
            message: "Duplicate section ids",
          },
          {
            check: () => true, // Default case
            message: "total targetWordCount < 800",
          },
        ];

        // Find first matching rule (functional: no if-else chain)
        const failedRule = validationRules.find((rule) => rule.check(outline));
        const errorMessage =
          typeof failedRule!.message === "function"
            ? failedRule!.message(outline)
            : failedRule!.message;

        throw new Error(errorMessage);
      }
      return parsed;
    } catch (e: unknown) {
      const message = asErrorMessage(e);
      errors.push(message);
      console.warn(
        `[daily-trends] outline validation failed on attempt ${attempt}: ${message}`,
      );
    }
  }

  console.warn(
    `[daily-trends] Outline generation failed after retries: ${errors.join(" | ")}. Using fallback.`,
  );
  return createFallbackOutline(sources, categorySlug, dateString);
}

export async function generateOutline({
  dateString,
  sources,
  categorySlug,
  pattern = "brief",
  recentTopics,
}: {
  dateString: string;
  sources: SourceItem[];
  categorySlug: string;
  pattern?: ArticlePattern;
  recentTopics?: Set<string>;
}): Promise<Outline> {
  const stageId = startStage("generateOutline", {
    dateString,
    categorySlug,
    pattern,
  });
  try {
    const outline = await retryOutlineGeneration(
      sources,
      CONTENT_CONSTRAINTS,
      dateString,
      categorySlug,
      pattern,
      recentTopics,
    );
    endStage(stageId, { sections: outline.sections.length });
    return outline;
  } catch (error: unknown) {
    endStage(stageId, { error: asErrorMessage(error) });
    throw error;
  }
}

export async function generateSection(
  section: OutlineSection,
  sources: SourceItem[],
  outline: Outline,
  previousSectionSummaries: SectionSummary[],
): Promise<string> {
  const stageId = startStage("generateSection", { sectionId: section.id });

  // Section-specific instructions lookup table (DeMarco: data over control flow)
  const SECTION_INSTRUCTIONS: Record<string, string> = {
    closing:
      'Add a concise "What this means for your team" section with 2-3 actionable bullets. USE HYPHENS (-) FOR ALL BULLETS.',
    conclusion:
      'Add a concise "What this means for your team" section with 2-3 actionable bullets. USE HYPHENS (-) FOR ALL BULLETS.',
    tldr: 'Create an ultra-concise TL;DR section with 3-4 bullet points and emojis (⚡, 🔍, 🎯, 🚀). CRITICAL: USE HYPHENS (-) FOR BULLETS, NOT MIDDLE DOTS (•). Each point MUST include an outcome clause showing "why it matters" for CTOs, PMs, or engineering leads. Wrap the ENTIRE TL;DR (after the H2 heading) inside a <Callout type="tldr">...your list...</Callout> JSX tag. DO NOT generate introductory text like "Here is the TL;DR:" inside the callout.',
    intro:
      'Write a direct, factual opening paragraph. NO "Imagine..." framing. Get straight to the point. Keep paragraphs short (3-4 sentences max).',
    default:
      "Keep paragraphs short (3-4 sentences max) for better readability.",
  };

  const specialInstructions =
    SECTION_INSTRUCTIONS[section.id] ?? SECTION_INSTRUCTIONS.default;

  const userPrompt = `
Section ID: ${section.id} (Title: ${section.title})
Article Outline Context: ${JSON.stringify(outline.sections.map((s) => s.id + ": " + s.title))}
Sources Data Summary: ${sources.map((s) => s.title).join(", ")}

CRITICAL: You are generating ONLY the content for the section [${section.id}].
DO NOT generate the entire article. DO NOT generate content for other sections in the outline.
DO NOT repeat the article title or generate a "TITLE" line at the start of the section.
If you generate the whole article, the build will fail. ONLY write the section [${section.id}]!

Generate about ${section.targetWordCount} words of detailed technical content.
Use one concrete, grounded example per section when helpful.
Start exactly with the content for this section, including its markdown heading (e.g. ## ${section.title}).

IMPORTANT: Do NOT repeat content from previous sections:
${previousSectionSummaries.map((s) => `- [${s.id}]: ${s.summary}`).join("\n")}

Do not use repetitive marketing framing. Avoid phrases like "Imagine...", "The landscape is evolving", "Rapidly changing world".
${specialInstructions}

SPECIAL FORMAT FOR "highlights" SECTION:
Create a "Key Features" section that:
- Uses bullet points with emojis where appropriate
- Extracts the 4-6 most important features/benefits from the sources
- Format EXACTLY: "- **[Emoji] [Feature name]:** [Brief description]"
- DO NOT use middle dots (•) or asterisks (*). ALWAYS use hyphens (-).
- Include practical benefits, not just technical specs
- End with the most notable differentiator

Table section must be simple, valid markdown with EXACTLY 4 columns (e.g., Approach/Tool, Paradigm, Mechanism, Benefit). Do NOT output empty first or last columns (e.g., | | ... | |).
IMPORTANT: For the table section, ONLY include actual tools/products/services mentioned in the article. Do NOT include "NeoWhisper Insights" or any reference to NeoWhisper as a tool.

OUTPUT FORMAT - ONLY THIS JSON:
{"body": "Your markdown content here. Escape quotes properly."}
`;

  const raw = await callAi(
    `${SYSTEM_RULES}\nTask: Write section [${section.id}] for a technical article.`,
    userPrompt,
    { responseFormat: { type: "json_object" } },
  );
  const res = (await parseJsonWithRepair({
    text: raw,
    label: `section [${section.id}] en`,
  })) as { body?: string };
  endStage(stageId);
  const body = typeof res.body === "string" ? res.body : "";
  return body || `[Section ${section.id} content unavailable.]`;
}

const retryTranslation =
  (lang: LanguageCode, sectionId: string, enBody: string, attempt = 0) =>
  async (): Promise<string> => {
    const retryMsg =
      attempt > 0
        ? "\nThe previous translation had structural or language issues. Preserve structure and output ONLY the target language."
        : "";
    const languageRule =
      LANGUAGE_TRANSLATION_RULES[lang] ?? `Output ONLY ${lang}.`;

    const userPrompt = `
Translate to ${lang}:
${enBody}

Ensure natural flow, correct terminology, and preservation of markdown structure.
${languageRule}
Do not introduce unsupported exact numeric claims in translation.
${retryMsg}
Return JSON { "body": "Markdown string" }
`;

    const raw = await callAi(
      `${SYSTEM_RULES}\nTranslation: Senior tech editor for ${lang}.`,
      userPrompt,
      { responseFormat: { type: "json_object" } },
    );
    const res = (await parseJsonWithRepair({
      text: raw,
      label: `section [${sectionId}] ${lang}`,
    })) as { body?: string };
    const body = res.body ?? "";
    const hasArtifacts = hasCrossLanguageArtifacts(lang, body);

    // Explicit control flow over nested ternary (DeMarco principle)
    const isValid =
      structuresMatch(body, enBody) && body.trim() && !hasArtifacts;
    if (isValid) {
      return body;
    }
    if (attempt < 1) {
      return await retryTranslation(lang, sectionId, enBody, attempt + 1)();
    }
    return body;
  };

export async function translateSection(
  enBody: string,
  lang: LanguageCode,
  sectionId: string,
): Promise<string> {
  const stageId = startStage("translateSection", { sectionId, lang });
  const finalBody = await retryTranslation(lang, sectionId, enBody)();

  const hasArtifacts = hasCrossLanguageArtifacts(lang, finalBody);
  const isValid = Boolean(
    finalBody.trim() && structuresMatch(finalBody, enBody) && !hasArtifacts,
  );

  if (!isValid) {
    console.warn(
      `[daily-trends] translation parity/language check failed for ${lang} section ${sectionId}. Continuing anyway.`,
    );
  }

  endStage(stageId);
  return isValid ? finalBody : "";
}

export async function expandSection(
  sectionId: string,
  currentBody: string,
  lang: LanguageCode,
): Promise<string> {
  const stageId = startStage("expandSection", { sectionId, lang });
  const userPrompt = `
Language: ${lang}
Content:
${currentBody}

Requirements:
- Add 30% more technical depth with more examples and analysis.
- Keep the existing style and tone consistent.
- Do NOT repeat section headings.
- Return a SINGLE, UNIFIED markdown block.

Return JSON { "body": "Expanded and unified markdown string" }
`;
  const raw = await callAi(
    `${SYSTEM_RULES}\nContent Evolution: Add 30% more technical depth to this section.`,
    userPrompt,
    { responseFormat: { type: "json_object" } },
  );
  const res = (await parseJsonWithRepair({
    text: raw,
    label: `expansion [${sectionId}] ${lang}`,
  })) as { body?: string };
  endStage(stageId);
  return res.body ?? currentBody;
}

async function generateSectionWithSummary(
  section: OutlineSection,
  sources: SourceItem[],
  outline: Outline,
  completedEn: SectionSummary[],
  stagedContent: StagedContent,
): Promise<void> {
  if (AiState.totalTokensUsed > MAX_TOKENS_PER_RUN) {
    console.log(
      "[COST GUARD] Token limit reached. Assembling article with sections completed so far.",
    );
    throw new Error("TOKEN_LIMIT_REACHED");
  }

  console.log(`[daily-trends] creating section ${section.id}...`);
  const en = await generateSection(section, sources, outline, completedEn);
  stagedContent.en.sections[section.id] = en;

  const summaryRaw = await callAi(
    "You are a summarizer.",
    `Summarize this in 2-3 sentences:\n${String(en).slice(0, 2000)}\nReturn JSON { "summary": "..." }`,
    { responseFormat: { type: "json_object" } },
  );
  const summaryRes = (await parseJsonWithRepair({
    text: summaryRaw,
    label: `summary [${section.id}]`,
  })) as { summary?: string };
  completedEn.push({ id: section.id, summary: summaryRes.summary ?? "" });

  const translationLanguages = stagedContent.targetLanguages.filter(
    (lang) => lang !== "en",
  );
  await Promise.all(
    translationLanguages.map(async (lang) => {
      stagedContent[lang].sections[section.id] = await translateSection(
        en,
        lang,
        section.id,
      );
    }),
  );
}

async function expandUndersizedContent(
  lang: LanguageCode,
  stagedContent: StagedContent,
): Promise<void> {
  let total = computeWordCounts(stagedContent[lang].sections, lang);
  let attempts = 0;

  const shouldContinueExpanding = () =>
    total < MIN_WORDS_THRESHOLD &&
    attempts < EXPANSION_RETRY_LIMIT &&
    AiState.totalTokensUsed <= MAX_TOKENS_PER_RUN;

  const executeExpansion = async () => {
    const targets = selectSectionsToExpand(stagedContent[lang].sections);
    if (targets.length === 0) return false;

    const targetId = targets[0];
    console.log(
      `[daily-trends] ${lang} under length (${total}w), expanding ${targetId}...`,
    );
    stagedContent[lang].sections[targetId] = await expandSection(
      targetId,
      stagedContent[lang].sections[targetId],
      lang,
    );
    total = computeWordCounts(stagedContent[lang].sections, lang);
    attempts++;
    return true;
  };

  while (shouldContinueExpanding()) {
    const expanded = await executeExpansion();
    if (!expanded) break;
  }
}

async function polishAllLanguages(
  stagedContent: StagedContent,
  processingLanguages: LanguageCode[],
): Promise<void> {
  await Promise.all(
    processingLanguages.map(async (lang) => {
      const fullBody = Object.values(stagedContent[lang].sections).join("\n\n");
      stagedContent[lang].title = await polishMetadata(fullBody, lang, "title");
      stagedContent[lang].excerpt = await polishMetadata(
        fullBody,
        lang,
        "excerpt",
      );
    }),
  );
}

const normalizeTargetLanguages = (
  targetLanguages: readonly LanguageCode[] = LANGUAGE_ORDER,
): LanguageCode[] => {
  const filtered = targetLanguages.filter((lang): lang is LanguageCode =>
    LANGUAGE_ORDER.includes(lang),
  );
  return filtered.length > 0 ? [...new Set(filtered)] : [...LANGUAGE_ORDER];
};

export async function createStagedArticle({
  dateString,
  sources,
  targetLanguages = LANGUAGE_ORDER,
  preferredCategorySlug = null,
  pattern = "brief",
  recentTopics,
}: {
  dateString: string;
  sources: SourceItem[];
  targetLanguages?: readonly LanguageCode[];
  preferredCategorySlug?: string | null;
  pattern?: ArticlePattern;
  recentTopics?: Set<string>;
}) {
  const selectedLanguages = normalizeTargetLanguages(targetLanguages);
  const processingLanguages: LanguageCode[] = [
    ...new Set(["en", ...selectedLanguages] as LanguageCode[]),
  ];
  const preferredCategory = preferredCategorySlug
    ? (ConfigState.CATEGORY_MAP.get(preferredCategorySlug) ?? null)
    : null;
  const category = pickCategory(preferredCategory, sources);

  const outline = await generateOutline({
    dateString,
    sources,
    categorySlug: category.slug,
    pattern,
    recentTopics,
  });

  const stagedContent: StagedContent = {
    en: { sections: {} },
    ja: { sections: {} },
    ar: { sections: {} },
    targetLanguages: selectedLanguages,
  };

  const completedEn: SectionSummary[] = [];

  try {
    for (const section of outline.sections) {
      await generateSectionWithSummary(
        section,
        sources,
        outline,
        completedEn,
        stagedContent,
      );
    }
  } catch (e: unknown) {
    if (asErrorMessage(e) !== "TOKEN_LIMIT_REACHED") {
      throw e;
    }
  }

  await Promise.all(
    processingLanguages.map((lang) =>
      expandUndersizedContent(lang, stagedContent),
    ),
  );

  await polishAllLanguages(stagedContent, processingLanguages);

  return { ...outline, ...stagedContent, categorySlug: category.slug };
}
