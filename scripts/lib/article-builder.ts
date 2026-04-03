import process from "node:process";
import { callAi, parseJsonWithRepair, AiState } from "./ai";
import { startStage, endStage } from "./metrics";
import {
  SYSTEM_RULES,
  CONTENT_CONSTRAINTS,
  MAX_TOKENS_PER_RUN,
  LANGUAGE_ORDER,
  MIN_WORDS_THRESHOLD,
  EXPANSION_RETRY_LIMIT,
  type LanguageCode
} from "./constants";
import { pickCategory, computeWordCounts, selectSectionsToExpand, polishMetadata } from "./utils";

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

const validateSection = (sec: unknown): sec is OutlineSection =>
  typeof sec === "object" &&
  sec !== null &&
  typeof (sec as Record<string, unknown>).id === "string" &&
  typeof (sec as Record<string, unknown>).title === "string" &&
  typeof (sec as Record<string, unknown>).intent === "string" &&
  typeof (sec as Record<string, unknown>).targetWordCount === "number";

const validateOutline = (outline: unknown): outline is Outline => {
  if (!outline || typeof outline !== "object") {
    return false;
  }
  const candidate = outline as { sections?: unknown };
  if (!Array.isArray(candidate.sections) || candidate.sections.length < 3) {
    return false;
  }

  const sections = candidate.sections as unknown[];
  const typedSections = sections.filter(validateSection);
  if (typedSections.length !== sections.length) {
    return false;
  }

  const noDuplicateIds = new Set(typedSections.map((s) => s.id)).size === typedSections.length;
  const minWords = typedSections.reduce((sum, s) => sum + s.targetWordCount, 0) >= 800;

  return noDuplicateIds && minWords;
};

const countStructureElements = (text: string): { headings: number; lists: number } => ({
  headings: (text.match(/^(##|###)\s/gm) || []).length,
  lists: (text.match(/^[-*]\s/gm) || []).length
});

const structuresMatch = (text1: string, text2: string, tolerance = 2): boolean => {
  const s1 = countStructureElements(text1);
  const s2 = countStructureElements(text2);
  return s1.headings === s2.headings && Math.abs(s1.lists - s2.lists) <= tolerance;
};

const logVerbose = (msg: string): void =>
  void (process.argv.includes("--verbose") && console.log(msg));

const LANGUAGE_TRANSLATION_RULES: Partial<Record<LanguageCode, string>> = {
  ja: "Output ONLY Japanese. Do not include English, Chinese, or Arabic sentences except product names and URLs.",
  ar: "Output ONLY Modern Standard Arabic (الفصحى). Do not include Chinese, Japanese, or English sentences except product names and URLs."
};

const hasCrossLanguageArtifacts = (lang: LanguageCode, text: string): boolean => {
  if (lang === "ar") {
    return /[\u3040-\u30ff\u4e00-\u9fff]/u.test(text);
  }
  if (lang === "ja") {
    return /[\u0600-\u06ff]/u.test(text);
  }
  return false;
};

async function retryOutlineGeneration(
  sources: SourceItem[],
  constraint: string,
  dateString: string,
  categorySlug: string
): Promise<Outline> {
  const attempts = [0, 1, 2];
  const errors: string[] = [];

  for (const attempt of attempts) {
    const retryMsg = attempt > 0
      ? "\nThe previous outline was rejected. Ensure every section has id, title, intent, and targetWordCount fields."
      : "";

    const userPrompt = `
Sources:
${sources.map((s, i) => `${i + 1}. [${s.source}] ${s.title}`).join("\n")}

${constraint}

Create a structured JSON outline:
- title_hint (string)
- slugSuffix (string)
- sections: Array of { id: string, title: string, intent: string, targetWordCount: number }
Required IDs: "intro", (3-4 "trend-*"), "neowhisper", "closing", "table"
${retryMsg}

Return JSON only.
`;

    try {
      const raw = await callAi(
        `${SYSTEM_RULES}\nTask: Create a staged article outline for ${dateString} category ${categorySlug}.`,
        userPrompt,
        { responseFormat: { type: "json_object" } }
      );
      const parsed = await parseJsonWithRepair({ text: raw, label: "outline generation" });

      if (!validateOutline(parsed)) {
        const outline = parsed as { sections?: unknown[] };
        throw new Error(
          !Array.isArray(outline.sections) || outline.sections.length < 3
            ? "Sections array must have at least 3 items"
            : outline.sections.some((s) => !validateSection(s))
              ? "Missing required section fields"
              : new Set((outline.sections as OutlineSection[]).map((s) => s.id)).size !== outline.sections.length
                ? "Duplicate section ids"
                : "total targetWordCount < 800"
        );
      }

      return parsed;
    } catch (e: unknown) {
      const message = asErrorMessage(e);
      errors.push(message);
      console.warn(`[daily-trends] outline validation failed on attempt ${attempt}: ${message}`);
    }
  }

  throw new Error(`Outline generation failed after retries: ${errors.join(" | ")}`);
}

export async function generateOutline({
  dateString,
  sources,
  categorySlug
}: {
  dateString: string;
  sources: SourceItem[];
  categorySlug: string;
}): Promise<Outline> {
  const stageId = startStage("generateOutline", { dateString, categorySlug });
  try {
    const outline = await retryOutlineGeneration(sources, CONTENT_CONSTRAINTS, dateString, categorySlug);
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
  previousSectionSummaries: SectionSummary[]
): Promise<string> {
  const stageId = startStage("generateSection", { sectionId: section.id });
  const systemPrompt = `${SYSTEM_RULES}\nEnglish Section Generator: ${section.title}`;
  const summariesText = previousSectionSummaries.length > 0
    ? previousSectionSummaries.map((s) => `[${s.id}]: ${s.summary}`).join("\n")
    : "None yet.";

  const userPrompt = `
Section ID: ${section.id}
Outline: ${JSON.stringify(outline.sections)}
Sources Data Summary: ${sources.map((s) => s.title).join(", ")}

Generate about ${section.targetWordCount} words of detailed technical content.
Use one concrete, grounded example per section when helpful.
Do not use repetitive marketing framing.
Add "What this means for your team" bullets.
Table section must be markdown.

IMPORTANT: For the table section, ONLY include actual tools/products/services mentioned in the article (e.g., Gemini, Lyria, etc.). Do NOT include "NeoWhisper Insights" or any reference to NeoWhisper as a tool - NeoWhisper is the company/site name, not a product.

IMPORTANT FACT RULE:
- Do not invent exact percentages, hard latency numbers, user counts, benchmark scores, or cost numbers.
- If a number is not clearly supported by provided sources, rewrite qualitatively.
- Distinguish clearly between currently available capabilities and forward-looking possibilities.

Do not repeat or rephrase content already covered in the following accepted sections:
${summariesText}

Return JSON { "body": "Markdown string" }
`;
  logVerbose(`[VERBOSE] section [${section.id}] prompt:\n${userPrompt}\n`);

  const raw = await callAi(systemPrompt, userPrompt, { responseFormat: { type: "json_object" } });
  const res = await parseJsonWithRepair({ text: raw, label: `section [${section.id}] en` }) as { body?: string };
  endStage(stageId);
  return res.body ?? "";
}

const retryTranslation = (
  lang: LanguageCode,
  sectionId: string,
  enBody: string,
  attempt = 0
) => async (): Promise<string> => {
  const retryMsg = attempt > 0
    ? "\nThe previous translation had structural or language issues. Preserve structure and output ONLY the target language."
    : "";
  const languageRule = LANGUAGE_TRANSLATION_RULES[lang] ?? `Output ONLY ${lang}.`;

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
    { responseFormat: { type: "json_object" } }
  );
  const res = await parseJsonWithRepair({ text: raw, label: `section [${sectionId}] ${lang}` }) as { body?: string };
  const body = res.body ?? "";
  const hasArtifacts = hasCrossLanguageArtifacts(lang, body);

  return (structuresMatch(body, enBody) && body.trim() && !hasArtifacts)
    ? body
    : attempt < 1
      ? await retryTranslation(lang, sectionId, enBody, attempt + 1)()
      : body;
};

export async function translateSection(enBody: string, lang: LanguageCode, sectionId: string): Promise<string> {
  const stageId = startStage("translateSection", { sectionId, lang });
  const finalBody = await retryTranslation(lang, sectionId, enBody)();

  const hasArtifacts = hasCrossLanguageArtifacts(lang, finalBody);
  const isValid = Boolean(finalBody.trim() && structuresMatch(finalBody, enBody) && !hasArtifacts);
  void (!isValid && console.warn(`[daily-trends] translation parity/language check failed for ${lang} section ${sectionId}. Continuing anyway.`));

  endStage(stageId);
  return isValid ? finalBody : "Translation incomplete.";
}

export async function expandSection(sectionId: string, currentBody: string, lang: LanguageCode): Promise<string> {
  const stageId = startStage("expandSection", { sectionId, lang });
  const userPrompt = `
Language: ${lang}
Content:
${currentBody}

Requirements: Add 30% more technical depth with more examples and analysis. Keep style consistent.
Do not add unsupported exact numeric claims.
Return JSON { "body": "Updated markdown string" }
`;
  const raw = await callAi(
    `${SYSTEM_RULES}\nContent Evolution: Add 30% more technical depth to this section.`,
    userPrompt,
    { responseFormat: { type: "json_object" } }
  );
  const res = await parseJsonWithRepair({ text: raw, label: `expansion [${sectionId}] ${lang}` }) as { body?: string };
  endStage(stageId);
  return res.body ?? currentBody;
}

async function generateSectionWithSummary(
  section: OutlineSection,
  sources: SourceItem[],
  outline: Outline,
  completedEn: SectionSummary[],
  stagedContent: StagedContent
): Promise<void> {
  void ((AiState.totalTokensUsed > MAX_TOKENS_PER_RUN) && (() => {
    console.log("[COST GUARD] Token limit reached. Assembling article with sections completed so far.");
    throw new Error("TOKEN_LIMIT_REACHED");
  })());

  console.log(`[daily-trends] creating section ${section.id}...`);
  const en = await generateSection(section, sources, outline, completedEn);
  stagedContent.en.sections[section.id] = en;

  const summaryRaw = await callAi(
    "You are a summarizer.",
    `Summarize this in 2-3 sentences:\n${en.slice(0, 2000)}\nReturn JSON { "summary": "..." }`,
    { responseFormat: { type: "json_object" } }
  );
  const summaryRes = await parseJsonWithRepair({ text: summaryRaw, label: `summary [${section.id}]` }) as { summary?: string };
  completedEn.push({ id: section.id, summary: summaryRes.summary ?? "" });

  const translationLanguages = stagedContent.targetLanguages.filter((lang) => lang !== "en");
  await Promise.all(
    translationLanguages.map(async (lang) => {
      stagedContent[lang].sections[section.id] = await translateSection(en, lang, section.id);
    })
  );
}

async function expandUndersizedContent(lang: LanguageCode, stagedContent: StagedContent): Promise<void> {
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
    console.log(`[daily-trends] ${lang} under length (${total}w), expanding ${targetId}...`);
    stagedContent[lang].sections[targetId] = await expandSection(targetId, stagedContent[lang].sections[targetId], lang);
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
  processingLanguages: LanguageCode[]
): Promise<void> {
  await Promise.all(
    processingLanguages.map(async (lang) => {
      const fullBody = Object.values(stagedContent[lang].sections).join("\n\n");
      stagedContent[lang].title = await polishMetadata(fullBody, lang, "title");
      stagedContent[lang].excerpt = await polishMetadata(fullBody, lang, "excerpt");
    })
  );
}

const normalizeTargetLanguages = (targetLanguages: readonly LanguageCode[] = LANGUAGE_ORDER): LanguageCode[] => {
  const filtered = targetLanguages.filter((lang): lang is LanguageCode =>
    (LANGUAGE_ORDER as readonly string[]).includes(lang)
  );
  return filtered.length > 0 ? [...new Set(filtered)] : [...LANGUAGE_ORDER];
};

export async function createStagedArticle({
  dateString,
  sources,
  targetLanguages = LANGUAGE_ORDER
}: {
  dateString: string;
  sources: SourceItem[];
  targetLanguages?: readonly LanguageCode[];
}) {
  const selectedLanguages = normalizeTargetLanguages(targetLanguages);
  const processingLanguages: LanguageCode[] = [...new Set(["en", ...selectedLanguages] as LanguageCode[])];
  const category = pickCategory(null, sources);
  const outline = await generateOutline({ dateString, sources, categorySlug: category.slug });

  const stagedContent: StagedContent = {
    en: { sections: {} },
    ja: { sections: {} },
    ar: { sections: {} },
    targetLanguages: selectedLanguages
  };

  const completedEn: SectionSummary[] = [];

  try {
    for (const section of outline.sections) {
      await generateSectionWithSummary(section, sources, outline, completedEn, stagedContent);
    }
  } catch (e: unknown) {
    void ((asErrorMessage(e) !== "TOKEN_LIMIT_REACHED") && (() => { throw e; })());
  }

  await Promise.all(
    processingLanguages.map((lang) => expandUndersizedContent(lang, stagedContent))
  );

  await polishAllLanguages(stagedContent, processingLanguages);

  return { ...outline, ...stagedContent, categorySlug: category.slug };
}
