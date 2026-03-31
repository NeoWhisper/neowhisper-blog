import process from "node:process";
import { callAi, parseJsonWithRepair, AiState } from "./ai.mjs";
import { startStage, endStage } from "./metrics.mjs";
import { SYSTEM_RULES, CONTENT_CONSTRAINTS, MAX_TOKENS_PER_RUN, LANGUAGE_ORDER, MIN_WORDS_THRESHOLD, EXPANSION_RETRY_LIMIT } from "./constants.mjs";
import { pickCategory, computeWordCounts, selectSectionsToExpand, polishMetadata } from "./utils.mjs";

export async function generateOutline({ dateString, sources, categorySlug }) {
  const stageId = startStage("generateOutline", { dateString, categorySlug });
  const systemPrompt = `${SYSTEM_RULES}\nTask: Create a staged article outline for ${dateString} category ${categorySlug}.`;
  
  let retryMsg = "";
  let lastErr = null;
  
  for (let attempt = 0; attempt < 3; attempt++) {
    const userPrompt = `
Sources:
${sources.map((s, i) => `${i + 1}. [${s.source}] ${s.title}`).join("\n")}

${CONTENT_CONSTRAINTS}

Create a structured JSON outline:
- title_hint (string)
- slugSuffix (string)
- sections: Array of { id: string, title: string, intent: string, targetWordCount: number }
Required IDs: "intro", (3-4 "trend-*"), "neowhisper", "closing", "table"
${retryMsg}

Return JSON only.
`;
    try {
      const raw = await callAi(systemPrompt, userPrompt, { responseFormat: { type: "json_object" } });
      const outline = await parseJsonWithRepair({ text: raw, label: "outline generation" });
      
      if (!Array.isArray(outline.sections) || outline.sections.length < 3) throw new Error("Sections array must have at least 3 items");
      
      let totalWords = 0;
      const idSet = new Set();
      for (const sec of outline.sections) {
        if (typeof sec.id !== "string") throw new Error("Missing section id");
        if (typeof sec.title !== "string") throw new Error("Missing section title");
        if (typeof sec.intent !== "string") throw new Error("Missing section intent");
        if (typeof sec.targetWordCount !== "number") throw new Error("targetWordCount must be a number");
        
        if (idSet.has(sec.id)) throw new Error("Duplicate section id");
        idSet.add(sec.id);
        totalWords += sec.targetWordCount;
      }
      
      if (totalWords < 800) throw new Error("total targetWordCount < 800");
      
      endStage(stageId, { sections: outline.sections.length });
      return outline;

    } catch (e) {
      lastErr = e;
      console.warn(`[daily-trends] outline validation failed on attempt ${attempt}: ${e.message}`);
      retryMsg = "\nThe previous outline was rejected. Ensure every section has id, title, intent, and targetWordCount fields.";
    }
  }
  
  endStage(stageId, { error: lastErr?.message });
  throw new Error(`Outline generation failed after retries: ${lastErr?.message}`);
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

Do not repeat or rephrase content already covered in the following accepted sections:
${summariesText}

Return JSON { "body": "Markdown string" }
`;
  if (process.argv.includes("--verbose")) {
    console.log(`[VERBOSE] section [${section.id}] prompt:\n${userPrompt}\n`);
  }
  const raw = await callAi(systemPrompt, userPrompt, { responseFormat: { type: "json_object" } });
  const res = await parseJsonWithRepair({ text: raw, label: `section [${section.id}] en` });
  endStage(stageId);
  return res.body;
}

export async function translateSection(enBody, lang, sectionId) {
  const stageId = startStage("translateSection", { sectionId, lang });
  const systemPrompt = `${SYSTEM_RULES}\nTranslation: Senior tech editor for ${lang}.`;
  
  let retryMsg = "";
  let finalBody = "";
  
  for (let attempt = 0; attempt < 2; attempt++) {
    const userPrompt = `
Translate to ${lang}:
${enBody}

Ensure natural flow, correct terminology, and preservation of markdown structure.
${retryMsg}
Return JSON { "body": "Markdown string" }
`;
    const raw = await callAi(systemPrompt, userPrompt, { responseFormat: { type: "json_object" } });
    const res = await parseJsonWithRepair({ text: raw, label: `section [${sectionId}] ${lang}` });
    const body = res.body || "";
    finalBody = body;
    
    if (!body.trim()) {
      retryMsg = "\nThe previous translation had structural issues. Preserve the same heading structure and list structure as the source.";
      continue;
    }
    
    const countHeadings = text => (text.match(/^(##|###)\s/gm) || []).length;
    const countLists = text => (text.match(/^[-*]\s/gm) || []).length;
    
    if (countHeadings(body) !== countHeadings(enBody)) {
      retryMsg = "\nThe previous translation had structural issues. Preserve the same heading structure and list structure as the source.";
      continue;
    }
    
    if (Math.abs(countLists(body) - countLists(enBody)) > 2) {
      retryMsg = "\nThe previous translation had structural issues. Preserve the same heading structure and list structure as the source.";
      continue;
    }
    
    break; // Checks passed
  }
  
  if (!finalBody) {
    console.warn(`[daily-trends] translation parity check failed for ${lang} section ${sectionId} after retries. Continuing anyway.`);
    finalBody = "Translation incomplete.";
  }
  
  endStage(stageId);
  return finalBody;
}

export async function expandSection(sectionId, currentBody, lang) {
  const stageId = startStage("expandSection", { sectionId, lang });
  const systemPrompt = `${SYSTEM_RULES}\nContent Evolution: Add 30% more technical depth to this section.`;
  const userPrompt = `
Language: ${lang}
Content:
${currentBody}

Requirements: Add more depth, examples, and analysis. Keep style consistent.
Return JSON { "body": "Updated markdown string" }
`;
  const raw = await callAi(systemPrompt, userPrompt, { responseFormat: { type: "json_object" } });
  const res = await parseJsonWithRepair({ text: raw, label: `expansion [${sectionId}] ${lang}` });
  endStage(stageId);
  return res.body;
}

export async function createStagedArticle({ dateString, sources }) {
  const category = pickCategory(null, sources);
  const outline = await generateOutline({ dateString, sources, categorySlug: category.slug });

  const stagedContent = {
    en: { sections: {} }, ja: { sections: {} }, ar: { sections: {} }
  };

  const completedEn = [];
  for (const section of outline.sections) {
    if (AiState.totalTokensUsed > MAX_TOKENS_PER_RUN) {
      console.log("[COST GUARD] Token limit reached. Assembling article with sections completed so far.");
      break;
    }
    console.log(`[daily-trends] creating section ${section.id}...`);
    let en = await generateSection(section, sources, outline, completedEn);
    stagedContent.en.sections[section.id] = en;
    
    // Extract summary
    const summaryRaw = await callAi(
      "You are a summarizer.",
      `Summarize this in 2-3 sentences:\n${en.slice(0, 2000)}\nReturn JSON { "summary": "..." }`,
      { responseFormat: { type: "json_object" } }
    );
    const summaryRes = await parseJsonWithRepair({ text: summaryRaw, label: `summary [${section.id}]` });
    completedEn.push({ id: section.id, summary: summaryRes.summary });

    for (const lang of ["ja", "ar"]) {
      stagedContent[lang].sections[section.id] = await translateSection(en, lang, section.id);
    }
  }

  // Iterate to fix length
  for (const lang of LANGUAGE_ORDER) {
    let total = computeWordCounts(stagedContent[lang].sections, lang);
    let attempts = 0;
    while (total < MIN_WORDS_THRESHOLD && attempts < EXPANSION_RETRY_LIMIT && AiState.totalTokensUsed <= MAX_TOKENS_PER_RUN) {
      const targets = selectSectionsToExpand(stagedContent[lang].sections, lang);
      if (targets.length === 0) break;
      const targetId = targets[0];
      console.log(`[daily-trends] ${lang} under length (${total}w), expanding ${targetId}...`);
      stagedContent[lang].sections[targetId] = await expandSection(targetId, stagedContent[lang].sections[targetId], lang);
      total = computeWordCounts(stagedContent[lang].sections, lang);
      attempts++;
    }
  }

  // Final Polish
  for (const lang of LANGUAGE_ORDER) {
    const fullBody = Object.values(stagedContent[lang].sections).join("\n\n");
    stagedContent[lang].title = await polishMetadata(fullBody, lang, "title");
    stagedContent[lang].excerpt = await polishMetadata(fullBody, lang, "excerpt");
  }

  return { ...outline, ...stagedContent, categorySlug: category.slug };
}
