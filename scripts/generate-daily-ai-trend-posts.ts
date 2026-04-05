#!/usr/bin/env node

/**
 * NeoWhisper Daily Trend Generator
 * Staged Pipeline Version (Refactored for AdSense Quality & Maintainability)
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { z } from "zod";
import { tocConfig } from "./config/toc-config";

import {
  API_BASE_URL,
  API_KEY,
  DRY_RUN,
  POSTS_DIR,
  COVER_IMAGE,
  AUTHOR_NAME,
  TOPIC_HINT,
  initializeConfigs,
  ConfigState,
} from "./lib/config";
import { fetchFeed } from "./lib/feed";
import type { FeedItem } from "./lib/feed";
import { AiState } from "./lib/ai";
import { flushMetrics } from "./lib/metrics";
import { createStagedArticle } from "./lib/article-builder";
import {
  LANGUAGE_ORDER,
  LANGUAGE_LABELS,
  type LanguageCode,
} from "./lib/constants";
import { resolveCategoryByInput, parsePatternFlag } from "./lib/utils";
import contentSafety from "./lib/content-safety";
import { generateCoverImage } from "./lib/image-gen";

const {
  normalizeExcerptText,
  normalizeMetadataText,
  sanitizeGeneratedMarkdown,
} = contentSafety;

const TocConfigSchema = z.object({
  excludedHeadings: z.array(z.string()),
});

type TocConfig = z.infer<typeof TocConfigSchema>;
type CategoryDefinition = (typeof ConfigState.CATEGORY_DEFINITIONS)[number];
type LocalizedContent = {
  title: unknown;
  excerpt: unknown;
  sections: Record<string, string>;
};
type StagedArticle = {
  categorySlug: string;
  slugSuffix: string;
  sections: Array<unknown>;
  en: LocalizedContent;
  ja: LocalizedContent;
  ar: LocalizedContent;
};

const loadTocConfig = (): TocConfig => TocConfigSchema.parse(tocConfig);

const yamlString = (value: unknown): string => {
  const json = JSON.stringify(String(value));
  return json.slice(1, -1);
};

const headingToAnchor = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const createShouldExcludeHeading =
  (excludedHeadings: string[]) => (text: string) =>
    excludedHeadings.some((excluded) => text.toLowerCase().includes(excluded));

const createGenerateToc = (excludedHeadings: string[]) => {
  const shouldExclude = createShouldExcludeHeading(excludedHeadings);
  return (markdownBody: string, tocHeading: string): string => {
    const headings = [...markdownBody.matchAll(/^##\s+(.+)$/gm)]
      .map((match: RegExpMatchArray) => (match[1] ?? "").trim())
      .filter((text) => !shouldExclude(text))
      .map((text) => ({
        text,
        anchor: headingToAnchor(text),
      }));

    return headings.length === 0
      ? ""
      : `${tocHeading}\n\n${headings.map((h) => `- [${h.text}](#${h.anchor})`).join("\n")}\n\n---\n\n`;
  };
};

type FrontmatterInput = {
  title: string;
  excerpt: string;
  categoryName: string;
  dateString: string;
  coverImage: string;
};

const buildFrontmatter = ({
  title,
  excerpt,
  categoryName,
  dateString,
  coverImage,
}: FrontmatterInput): string[] => [
  "---",
  `title: "${yamlString(title)}"`,
  `date: "${dateString}"`,
  `excerpt: "${yamlString(excerpt)}"`,
  `category: "${categoryName}"`,
  `coverImage: "${coverImage}"`,
  "author:",
  `  name: "${AUTHOR_NAME}"`,
  '  picture: "/images/author.png"',
  "---",
];

const getCategoryDisplayName = (
  category: CategoryDefinition,
  lang: LanguageCode,
): string => {
  const keyByLang: Record<LanguageCode, keyof CategoryDefinition> = {
    en: "nameEn",
    ja: "nameJa",
    ar: "nameAr",
  };
  return String(category[keyByLang[lang]]);
};

const writePostFile = async (filePath: string, doc: string): Promise<void> =>
  DRY_RUN
    ? void console.log(`[DRY RUN] ${filePath}`)
    : fs
        .writeFile(filePath, doc)
        .then(() => console.log(`[daily-trends] wrote ${filePath}`));

const guardApiKey = () => {
  const isOfficialOpenAi = new URL(API_BASE_URL).hostname === "api.openai.com";
  return !(
    isOfficialOpenAi &&
    !API_KEY &&
    (console.log(
      "OPENAI_API_KEY is not set for official OpenAI endpoint; skipping daily trend draft generation.",
    ),
    process.exit(0))
  );
};

const MIN_SOURCES_REQUIRED = Number.parseInt(
  process.env.TREND_MIN_SOURCES ?? "3",
  10,
);
const DEFAULT_RECENT_DAYS = Number.parseInt(
  process.env.TREND_RECENT_DAYS ?? "3",
  10,
);

const guardMinSources = (sources: RankedSource[]): RankedSource[] => {
  return sources.length < Math.max(1, MIN_SOURCES_REQUIRED)
    ? (console.log("Low sources, skip"), process.exit(0), [])
    : sources;
};

type RankedSource = {
  title: string;
  url: string;
  source: string;
  summary?: string;
  publishedAt?: string;
};

const toRankedSource = (source: FeedItem): RankedSource => ({
  title: source.title,
  url: source.link,
  source: source.feed,
  summary: source.description,
  publishedAt: source.publishedAt,
});

const uniqueByUrl = (sources: RankedSource[]) =>
  Array.from(new Map(sources.map((item) => [item.url, item])).values());

const normalizeWord = (value: string) => value.trim().toLowerCase();

const topicHintTerms = TOPIC_HINT.split(/[\s,]+/)
  .map(normalizeWord)
  .filter((term) => term.length >= 3);

const allConfiguredKeywords = Object.values(ConfigState.KEYWORDS)
  .flat()
  .map(normalizeWord);

const includesAnyKeyword = (text: string, keywords: string[]) =>
  keywords.some((keyword) => text.includes(keyword));

const pickRankedSources = (rawSources: FeedItem[]): RankedSource[] => {
  const normalized = rawSources.map(toRankedSource);
  const trendKeywords = ConfigState.KEYWORDS.trend.map(normalizeWord);

  const byTrend = uniqueByUrl(
    normalized.filter((item) =>
      includesAnyKeyword(
        `${item.title} ${item.summary ?? ""}`.toLowerCase(),
        trendKeywords,
      ),
    ),
  );
  console.log(
    `[daily-trends] source pool: raw=${normalized.length}, trend=${byTrend.length}`,
  );
  if (byTrend.length >= MIN_SOURCES_REQUIRED) {
    return byTrend.slice(0, 6);
  }

  const expandedKeywords = Array.from(
    new Set([...allConfiguredKeywords, ...topicHintTerms]),
  );
  const byExpanded = uniqueByUrl(
    normalized.filter((item) =>
      includesAnyKeyword(
        `${item.title} ${item.summary ?? ""}`.toLowerCase(),
        expandedKeywords,
      ),
    ),
  );
  console.log(`[daily-trends] source pool: expanded=${byExpanded.length}`);
  if (byExpanded.length >= MIN_SOURCES_REQUIRED) {
    console.warn(
      "[daily-trends] trend-only sources were low; using expanded keyword matching.",
    );
    return byExpanded.slice(0, 6);
  }

  const fallbackPool = uniqueByUrl(normalized);
  console.log(
    `[daily-trends] source pool: fallback=${fallbackPool.length}, min_required=${Math.max(1, MIN_SOURCES_REQUIRED)}`,
  );
  if (fallbackPool.length >= MIN_SOURCES_REQUIRED) {
    console.warn(
      "[daily-trends] keyword-matched sources were low; using top feed items fallback.",
    );
    return fallbackPool.slice(0, 6);
  }

  return fallbackPool;
};

const parsePositiveInt = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseCategoryFlag = (): string | null => {
  const arg = process.argv.find((entry: string) =>
    entry.startsWith("--category="),
  );
  if (!arg) return null;
  const raw = arg.slice("--category=".length).trim();
  return raw.length > 0 ? raw : null;
};

const parseRecentDays = (): number => {
  const arg = process.argv.find((entry: string) =>
    entry.startsWith("--recent-days="),
  );
  const value = arg?.slice("--recent-days=".length);
  return parsePositiveInt(value, DEFAULT_RECENT_DAYS);
};

const isRecentSource = (
  source: RankedSource,
  recentDays: number,
  nowMs: number,
): boolean => {
  if (!source.publishedAt) return false;
  const publishedMs = new Date(source.publishedAt).getTime();
  if (Number.isNaN(publishedMs)) return false;
  const cutoffMs = nowMs - recentDays * 24 * 60 * 60 * 1000;
  return publishedMs >= cutoffMs;
};

const pickSourcesByCategoryAndRecency = (
  sources: RankedSource[],
  categoryKeywords: string[],
  recentDays: number,
): RankedSource[] => {
  const nowMs = Date.now();
  const normalizedKeywords = categoryKeywords.map((keyword) =>
    keyword.toLowerCase(),
  );
  const withSignals = sources.map((source) => {
    const text = `${source.title} ${source.summary ?? ""}`.toLowerCase();
    const keywordHits = normalizedKeywords.reduce(
      (sum, keyword) => sum + (text.includes(keyword) ? 1 : 0),
      0,
    );
    const recent = isRecentSource(source, recentDays, nowMs);
    return { source, keywordHits, recent };
  });

  const strictMatches = withSignals.filter(
    (item) => item.recent && item.keywordHits > 0,
  );
  if (strictMatches.length >= Math.max(1, MIN_SOURCES_REQUIRED)) {
    return strictMatches
      .sort((a, b) => b.keywordHits - a.keywordHits)
      .map((item) => item.source)
      .slice(0, 6);
  }

  const recentOnly = withSignals.filter((item) => item.recent);
  if (recentOnly.length >= Math.max(1, MIN_SOURCES_REQUIRED)) {
    return recentOnly
      .sort((a, b) => b.keywordHits - a.keywordHits)
      .map((item) => item.source)
      .slice(0, 6);
  }

  const keywordOnly = withSignals.filter((item) => item.keywordHits > 0);
  if (keywordOnly.length >= Math.max(1, MIN_SOURCES_REQUIRED)) {
    return keywordOnly
      .sort((a, b) => b.keywordHits - a.keywordHits)
      .map((item) => item.source)
      .slice(0, 6);
  }

  return sources.slice(0, 6);
};

const isLanguageCode = (value: string): value is LanguageCode =>
  (LANGUAGE_ORDER as readonly string[]).includes(value);

const parseLangFlag = (): LanguageCode | null => {
  const arg = process.argv.find((entry: string) => entry.startsWith("--lang="));
  if (!arg) return null;
  const normalized = arg.slice("--lang=".length).trim().toLowerCase();
  return isLanguageCode(normalized) ? normalized : null;
};

const resolveTargetLanguages = (): LanguageCode[] => {
  const explicitArg = process.argv.find((entry: string) =>
    entry.startsWith("--lang="),
  );
  const selectedLang = parseLangFlag();

  if (!explicitArg) return [...LANGUAGE_ORDER];
  if (!selectedLang) {
    const badValue = explicitArg.slice("--lang=".length).trim();
    throw new Error(
      `Unsupported --lang value "${badValue}". Use one of: ${LANGUAGE_ORDER.join(", ")}`,
    );
  }
  return [selectedLang];
};

const VALIDATE_CONFIG_ONLY = process.argv.includes("--validate-config");

async function main() {
  guardApiKey();
  await initializeConfigs();

  const targetLanguages = resolveTargetLanguages();
  const requestedCategoryInput = parseCategoryFlag();
  const recentDays = parseRecentDays();
  const resolvedTocConfig = loadTocConfig();
  const generateToc = createGenerateToc(resolvedTocConfig.excludedHeadings);
  const requestedCategory = requestedCategoryInput
    ? resolveCategoryByInput(requestedCategoryInput)
    : null;

  if (requestedCategoryInput && !requestedCategory) {
    throw new Error(
      `Unsupported --category value "${requestedCategoryInput}". Use one of configured category slugs/names.`,
    );
  }

  if (VALIDATE_CONFIG_ONLY) {
    console.log(
      `[daily-trends] config validation OK (languages: ${targetLanguages.join(", ")})`,
    );
    return;
  }

  const dateString = new Date().toISOString().slice(0, 10);
  console.log(`[daily-trends] starting ${dateString}`);

  const rawSources = (
    await Promise.allSettled(ConfigState.FEEDS.map((f) => fetchFeed(f)))
  )
    .filter(
      (r): r is PromiseFulfilledResult<FeedItem[]> => r.status === "fulfilled",
    )
    .flatMap((r) => r.value);

  const baseRanked = pickRankedSources(rawSources);
  const ranked = guardMinSources(
    requestedCategory
      ? pickSourcesByCategoryAndRecency(
          baseRanked,
          requestedCategory.keywords,
          recentDays,
        )
      : baseRanked,
  );

  if (requestedCategory) {
    console.log(
      `[daily-trends] selected category=${requestedCategory.slug}, recent_days=${recentDays}, sources=${ranked.length}`,
    );
  }

  const content = (await createStagedArticle({
    dateString,
    sources: ranked,
    targetLanguages,
    preferredCategorySlug: requestedCategory?.slug ?? null,
    pattern: parsePatternFlag(),
  })) as StagedArticle;
  const category =
    ConfigState.CATEGORY_MAP.get(content.categorySlug) ??
    (ConfigState.CATEGORY_DEFINITIONS[0] as CategoryDefinition);

  void (
    !ConfigState.CATEGORY_MAP.has(content.categorySlug) &&
    console.warn(
      `[daily-trends] Category slug "${content.categorySlug}" not found — falling back to "${category.slug}".`,
    )
  );

  const baseSlug = `ai-it-trend-brief-${dateString}-${content.slugSuffix.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  // Generate cover image using Ollama if configured
  const generatedCoverImage = await generateCoverImage(
    content.en.title as string,
    content.en.excerpt as string,
    dateString,
  );
  const coverImage = generatedCoverImage ?? COVER_IMAGE;

  await Promise.all(
    targetLanguages.map(async (lang: LanguageCode) => {
      const meta = LANGUAGE_LABELS[lang];
      const localized = content[lang] as LocalizedContent;
      const finalBody = sanitizeGeneratedMarkdown(
        Object.values(localized.sections).join("\n\n"),
      );
      const toc = generateToc(finalBody, meta.tocHeading);
      const fallbackTitle = normalizeMetadataText(
        content.en.title,
        "Daily AI Trend Brief",
      );
      const title = normalizeMetadataText(localized.title, fallbackTitle);
      const excerptFallback =
        finalBody
          .split("\n")
          .find((line) => line.trim() && !line.startsWith("#"))
          ?.trim() ?? "";
      const excerpt = normalizeExcerptText(localized.excerpt, excerptFallback);
      const referencesSection = ranked
        .map((s) => `- [${sanitizeGeneratedMarkdown(s.title)}](${s.url})`)
        .join("\n");

      const doc = sanitizeGeneratedMarkdown(
        [
          ...buildFrontmatter({
            title,
            excerpt,
            categoryName: getCategoryDisplayName(category, lang),
            dateString,
            coverImage,
          }),
          "",
          toc,
          finalBody,
          "",
          meta.referencesHeading,
          "",
          referencesSection,
        ].join("\n"),
      );

      const filePath = path.join(
        POSTS_DIR,
        `${baseSlug}${meta.fileSuffix}.mdx`,
      );
      await writePostFile(filePath, doc);
    }),
  );

  console.log(
    `[RUN COMPLETE] Total tokens used: ${AiState.totalTokensUsed} | Sections generated: ${Object.keys(content.en.sections).length}/${content.sections.length} | Languages: ${targetLanguages.join("/")}`,
  );

  await flushMetrics();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
