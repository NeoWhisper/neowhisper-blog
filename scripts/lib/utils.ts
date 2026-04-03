import { callAi, parseJsonWithRepair } from "./ai";
import {
  SYSTEM_RULES,
  ARTICLE_PATTERNS,
  type ArticlePattern,
} from "./constants";
import { ConfigState } from "./config";

const LANGUAGE_WORD_DENOMINATORS: Partial<Record<string, number>> = { ja: 2.5 };

type SourceItem = {
  title: string;
  summary?: string;
};

type CategoryDefinition = (typeof ConfigState.CATEGORY_DEFINITIONS)[number];

const normalize = (value: string): string =>
  value.normalize("NFKC").trim().toLowerCase();

export function countWords(text: string, lang: string): number {
  const denominator = LANGUAGE_WORD_DENOMINATORS[lang];
  return denominator
    ? Math.round(text.length / denominator)
    : text.split(/\s+/).filter(Boolean).length;
}

export function computeWordCounts(
  sections: Record<string, string>,
  lang: string,
): number {
  return countWords(Object.values(sections).join("\n"), lang);
}

export function selectSectionsToExpand(
  sections: Record<string, string>,
): string[] {
  return Object.entries(sections)
    .filter(([id]) => id.startsWith("trend"))
    .map(([id]) => id);
}

export async function polishMetadata(
  body: string,
  language: string,
  metadataType: "title" | "excerpt",
): Promise<string> {
  const raw = await callAi(
    `${SYSTEM_RULES}\nGenerate ${metadataType} for the content.`,
    `Language: ${language}\nContent: ${body.slice(0, 3000)}\nReturn JSON { "result": "..." }`,
    { responseFormat: { type: "json_object" } },
  );
  return (
    await parseJsonWithRepair({ text: raw, label: `polish ${metadataType}` })
  ).result;
}

export function resolveCategoryByInput(
  input: string,
): CategoryDefinition | null {
  const normalizedInput = normalize(input);
  return (
    ConfigState.CATEGORY_DEFINITIONS.find((category) =>
      [category.slug, category.nameEn, category.nameJa, category.nameAr].some(
        (value) => normalize(String(value)) === normalizedInput,
      ),
    ) ?? null
  );
}

export function pickCategory(
  preferredCategory: CategoryDefinition | null,
  sources: SourceItem[],
): CategoryDefinition {
  if (preferredCategory) {
    return preferredCategory;
  }

  const aggregatedContent = sources
    .map((x) => `${x.title} ${x.summary ?? ""}`.toLowerCase())
    .join(" ");

  return (
    ConfigState.CATEGORY_DEFINITIONS.map((category) => ({
      category,
      score: category.keywords.reduce(
        (sum, keyword) => sum + (aggregatedContent.includes(keyword) ? 1 : 0),
        0,
      ),
    }))
      .sort((a, b) => b.score - a.score)
      .at(0)?.category ?? ConfigState.CATEGORY_DEFINITIONS[0]
  );
}

export function parsePatternFlag(): ArticlePattern {
  const arg = process.argv.find((entry: string) =>
    entry.startsWith("--pattern="),
  );
  const value = arg?.slice("--pattern=".length).trim().toLowerCase();
  return (ARTICLE_PATTERNS as readonly string[]).includes(value ?? "")
    ? (value as ArticlePattern)
    : "brief";
}
