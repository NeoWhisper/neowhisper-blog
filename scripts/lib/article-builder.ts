import process from "node:process";
import { callAi, parseJsonWithRepair, AiState } from "./ai";
import { startStage, endStage } from "./metrics";
import { SYSTEM_RULES, CONTENT_CONSTRAINTS, MAX_TOKENS_PER_RUN, LANGUAGE_ORDER, MIN_WORDS_THRESHOLD, EXPANSION_RETRY_LIMIT } from "./constants";
import { pickCategory, computeWordCounts, selectSectionsToExpand, polishMetadata } from "./utils";

const validateSection = (sec) =>
  typeof sec.id === "string" &&
  typeof sec.title === "string" &&
  typeof sec.intent === "string" &&
  typeof sec.targetWordCount === "number";

const validateOutline = (outline) => {
  if (!Array.isArray(outline.sections) || outline.sections.length < 3) {
    return false;
  }

  const allSectionsValid = outline.sections.every(validateSection);
  const noDuplicateIds = new Set(outline.sections.map(s => s.id)).size === outline.sections.length;
  const minWords = outline.sections.reduce((sum, s) => sum + s.targetWordCount, 0) >= 800;

  return allSectionsValid && noDuplicateIds && minWords;
};

const countStructureElements = (text) => ({
  headings: (text.match(/^(##|###)\s/gm) || []).length,
  lists: (text.match(/^[-*]\s/gm) || []).length
});

const structuresMatch = (text1, text2, tolerance = 2) => {
  const s1 = countStructureElements(text1);
  const s2 = countStructureElements(text2);
  return s1.headings === s2.headings && Math.abs(s1.lists - s2.lists) <= tolerance;
};

const logVerbose = (msg) =>
  process.argv.includes("--verbose") && console.log(msg);

const LANGUAGE_TRANSLATION_RULES = {
  ja: "Output ONLY Japanese. Do not include English, Chinese, or Arabic sentences except product names and URLs.",
  ar: "Output ONLY Modern Standard Arabic (الفصحى). Do not include Chinese, Japanese, or English sentences except product names and URLs."
};

async function retryOutlineGeneration(sources, constraint, dateString, categorySlug) {
  const attempts = [0, 1, 2];
  const errors = [];

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
      const outline = await parseJsonWithRepair({ text: raw, label: "outline generation" });

      void (validateOutline(outline) || (() => {
        throw new Error(
          !Array.isArray(outline.sections) || outline.sections.length < 3
            ? "Sections array must have at least 3 items"
            : outline.sections.some(s => !validateSection(s))
              ? "Missing required section fields"
              : new Set(outline.sections.map(s => s.id)).size !== outline.sections.length
                ? "Duplicate section ids"
                : "total targetWordCount < 800"
        );
      })());

      return outline;
    } catch (e) {
      errors.push(e.message);
      console.warn(`[daily-trends] outline validation failed on attempt ${attempt}: ${e.message}`);
    }
  }

  throw new Error(`Outline generation failed after retries: ${errors.join(" | ")}`);
}

export async function generateOutline({ dateString, sources, categorySlug }) {
  const stageId = startStage("generateOutline", { dateString, categorySlug });
  try {
    const outline = await retryOutlineGeneration(sources, CONTENT_CONSTRAINTS, dateString, categorySlug);
    endStage(stageId, { sections: outline.sections.length });
    return outline;
  } catch (error) {
    endStage(stageId, { error: error?.message });
    throw error;
  }
}

export async function generateSection(section, sources, outline, previousSectionSummaries) {
  const stageId = startStage("generateSection", { sectionId: section.id });
  const systemPrompt = `${SYSTEM_RULES}\nEnglish Section Generator: ${section.title}`;
  const summariesText = previousSectionSummaries.length > 0
    ? previousSectionSummaries.map(s => `[${s.id}]: ${s.summary}`).join("\n")
    : "None yet.";

  const userPrompt = `
Section ID: ${section.id}
Outline: ${JSON.stringify(outline.sections)}
Sources Data Summary: ${sources.map(s => s.title).join(", ")}

Generate about ${section.targetWordCount} words of detailed technical content.
Include "Imagine..." for trends and "What this means for your team" bullets.
Table section must be markdown.

IMPORTANT: For the table section, ONLY include actual tools/products/services mentioned in the article (e.g., Gemini, Lyria, etc.). Do NOT include "NeoWhisper Insights" or any reference to NeoWhisper as a tool - NeoWhisper is the company/site name, not a product.

Do not repeat or rephrase content already covered in the following accepted sections:
${summariesText}

Return JSON { "body": "Markdown string" }
`;
  logVerbose(`[VERBOSE] section [${section.id}] prompt:\n${userPrompt}\n`);

  const raw = await callAi(systemPrompt, userPrompt, { responseFormat: { type: "json_object" } });
  const res = await parseJsonWithRepair({ text: raw, label: `section [${section.id}] en` });
  endStage(stageId);
  return res.body;
}

const retryTranslation = (lang, sectionId, enBody, attempt = 0) => async () => {
  const retryMsg = attempt > 0
    ? "\nThe previous translation had structural issues. Preserve the same heading structure and list structure as the source."
    : "";
  const languageRule = LANGUAGE_TRANSLATION_RULES[lang] ?? `Output ONLY ${lang}.`;

  const userPrompt = `
Translate to ${lang}:
${enBody}

Ensure natural flow, correct terminology, and preservation of markdown structure.
${languageRule}
${retryMsg}
Return JSON { "body": "Markdown string" }
`;

  const raw = await callAi(
    `${SYSTEM_RULES}\nTranslation: Senior tech editor for ${lang}.`,
    userPrompt,
    { responseFormat: { type: "json_object" } }
  );
  const res = await parseJsonWithRepair({ text: raw, label: `section [${sectionId}] ${lang}` });
  const body = res.body ?? "";

  return (structuresMatch(body, enBody) && body.trim())
    ? body
    : attempt < 1
      ? await retryTranslation(lang, sectionId, enBody, attempt + 1)()
      : body;
};

export async function translateSection(enBody, lang, sectionId) {
  const stageId = startStage("translateSection", { sectionId, lang });
  const finalBody = await retryTranslation(lang, sectionId, enBody)();

  const isValid = finalBody.trim() && structuresMatch(finalBody, enBody);
  void (!isValid && console.warn(`[daily-trends] translation parity check failed for ${lang} section ${sectionId}. Continuing anyway.`));

  endStage(stageId);
  return isValid ? finalBody : "Translation incomplete.";
}

export async function expandSection(sectionId, currentBody, lang) {
  const stageId = startStage("expandSection", { sectionId, lang });
  const userPrompt = `
Language: ${lang}
Content:
${currentBody}

Requirements: Add 30% more technical depth with more examples and analysis. Keep style consistent.
Return JSON { "body": "Updated markdown string" }
`;
  const raw = await callAi(
    `${SYSTEM_RULES}\nContent Evolution: Add 30% more technical depth to this section.`,
    userPrompt,
    { responseFormat: { type: "json_object" } }
  );
  const res = await parseJsonWithRepair({ text: raw, label: `expansion [${sectionId}] ${lang}` });
  endStage(stageId);
  return res.body;
}

async function generateSectionWithSummary(section, sources, outline, completedEn, stagedContent) {
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
  const summaryRes = await parseJsonWithRepair({ text: summaryRaw, label: `summary [${section.id}]` });
  completedEn.push({ id: section.id, summary: summaryRes.summary });

  const translationLanguages = stagedContent.targetLanguages.filter((lang) => lang !== "en");
  await Promise.all(
    translationLanguages.map(async (lang) => {
      stagedContent[lang].sections[section.id] = await translateSection(en, lang, section.id);
    })
  );
}

async function expandUndersizedContent(lang, stagedContent) {
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

async function polishAllLanguages(stagedContent, processingLanguages) {
  await Promise.all(
    processingLanguages.map(async (lang) => {
      const fullBody = Object.values(stagedContent[lang].sections).join("\n\n");
      stagedContent[lang].title = await polishMetadata(fullBody, lang, "title");
      stagedContent[lang].excerpt = await polishMetadata(fullBody, lang, "excerpt");
    })
  );
}

const normalizeTargetLanguages = (targetLanguages = LANGUAGE_ORDER) => {
  const filtered = targetLanguages.filter((lang) => LANGUAGE_ORDER.includes(lang));
  return filtered.length > 0 ? [...new Set(filtered)] : [...LANGUAGE_ORDER];
};

export async function createStagedArticle({ dateString, sources, targetLanguages = LANGUAGE_ORDER }) {
  const selectedLanguages = normalizeTargetLanguages(targetLanguages);
  const processingLanguages = [...new Set(["en", ...selectedLanguages])];
  const category = pickCategory(null, sources);
  const outline = await generateOutline({ dateString, sources, categorySlug: category.slug });

  const stagedContent = Object.freeze({
    en: { sections: {} },
    ja: { sections: {} },
    ar: { sections: {} },
    targetLanguages: selectedLanguages
  });

  const completedEn = [];

  try {
    for (const section of outline.sections) {
      await generateSectionWithSummary(section, sources, outline, completedEn, stagedContent);
    }
  } catch (e) {
    void ((e.message !== "TOKEN_LIMIT_REACHED") && (() => { throw e; })());
  }

  await Promise.all(
    processingLanguages.map((lang) => expandUndersizedContent(lang, stagedContent))
  );

  await polishAllLanguages(stagedContent, processingLanguages);

  return { ...outline, ...stagedContent, categorySlug: category.slug };
}
