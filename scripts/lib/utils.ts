import { callAi, parseJsonWithRepair } from "./ai";
import { SYSTEM_RULES } from "./constants";
import { ConfigState } from "./config";

const LANGUAGE_WORD_DENOMINATORS = { ja: 2.5 };

export function countWords(text, lang) {
  const denominator = LANGUAGE_WORD_DENOMINATORS[lang];
  return denominator
    ? Math.round(text.length / denominator)
    : text.split(/\s+/).filter(Boolean).length;
}

export function computeWordCounts(sections, lang) {
  return countWords(Object.values(sections).join("\n"), lang);
}

export function selectSectionsToExpand(sections) {
  return Object.entries(sections)
    .filter(([id]) => id.startsWith("trend"))
    .map(([id]) => id);
}

export async function polishMetadata(b, l, t) {
  const raw = await callAi(
    `${SYSTEM_RULES}\nGenerate ${t} for the content.`,
    `Language: ${l}\nContent: ${b.slice(0, 3000)}\nReturn JSON { "result": "..." }`,
    { responseFormat: { type: "json_object" } }
  );
  return (await parseJsonWithRepair({ text: raw, label: `polish ${t}` })).result;
}

export function pickCategory(_, sources) {
  const aggregatedContent = sources
    .map(x => `${x.title}${x.summary}`.toLowerCase())
    .join(" ");

  return ConfigState.CATEGORY_DEFINITIONS
    .map(category => ({
      category,
      score: category.keywords.reduce(
        (sum, keyword) => sum + (aggregatedContent.includes(keyword) ? 1 : 0),
        0
      )
    }))
    .sort((a, b) => b.score - a.score)
    .at(0)?.category ?? ConfigState.CATEGORY_DEFINITIONS[0];
}
