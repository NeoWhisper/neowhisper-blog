import { callAi, parseJsonWithRepair } from "./ai.mjs";
import { SYSTEM_RULES } from "./constants.mjs";
import { ConfigState } from "./config.mjs";

export function countWords(text, lang) {
  if (lang === 'ja') return Math.round(text.length / 2.5);
  return text.split(/\s+/).filter(Boolean).length;
}

export function computeWordCounts(sections, lang) {
  return countWords(Object.values(sections).join("\n"), lang);
}

export function selectSectionsToExpand(sections, lang) {
  const targetId = Object.keys(sections).find(id => id.startsWith("trend"));
  return targetId ? [targetId] : [];
}

export async function polishMetadata(b, l, t) {
  const raw = await callAi(`${SYSTEM_RULES}\nGenerate ${t} for the content.`, `Language: ${l}\nContent: ${b.slice(0, 3000)}\nReturn JSON { "result": "..." }`, { responseFormat: { type: "json_object" } });
  return (await parseJsonWithRepair({ text: raw, label: `polish ${t}` })).result;
}

export function pickCategory(_, s) {
  const agg = s.map(x => x.title + x.summary).join(" ").toLowerCase();
  let best = ConfigState.CATEGORY_DEFINITIONS[0];
  let max = 0;
  for (const c of ConfigState.CATEGORY_DEFINITIONS) {
    const sc = c.keywords.reduce((a, k) => a + (agg.includes(k) ? 1 : 0), 0);
    if (sc > max) { max = sc; best = c; }
  }
  return best;
}
