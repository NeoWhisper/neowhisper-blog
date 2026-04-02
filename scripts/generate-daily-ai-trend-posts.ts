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
import { LANGUAGE_ORDER, LANGUAGE_LABELS } from "./lib/constants";

const TocConfigSchema = z.object({
  excludedHeadings: z.array(z.string())
});

const loadTocConfig = () => TocConfigSchema.parse(tocConfig);

const yamlString = (value) => {
  const json = JSON.stringify(String(value));
  return json.slice(1, -1);
};

const headingToAnchor = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const createShouldExcludeHeading = (excludedHeadings) =>
  (text) => excludedHeadings.some(excluded => text.toLowerCase().includes(excluded));

const createGenerateToc = (excludedHeadings) => {
  const shouldExclude = createShouldExcludeHeading(excludedHeadings);
  return (markdownBody, tocHeading) => {
    const headings = Array.from(markdownBody.matchAll(/^##\s+(.+)$/gm))
      .map(match => match[1].trim())
      .filter(text => !shouldExclude(text))
      .map(text => ({
        text,
        anchor: headingToAnchor(text)
      }));

    return headings.length === 0
      ? ""
      : `${tocHeading}\n\n${headings.map(h => `- [${h.text}](#${h.anchor})`).join("\n")}\n\n---\n\n`;
  };
};

const buildFrontmatter = (content, meta, category, dateString) => [
  "---",
  `title: "${yamlString(content[meta.lang].title)}"`,
  `date: "${dateString}"`,
  `excerpt: "${yamlString(content[meta.lang].excerpt)}"`,
  `category: "${category[meta.categoryNameKey]}"`,
  `coverImage: "${COVER_IMAGE}"`,
  "author:",
  `  name: "${AUTHOR_NAME}"`,
  '  picture: "/images/author.png"',
  "---",
];

const writePostFile = async (filePath, doc) =>
  DRY_RUN
    ? console.log(`[DRY RUN] ${filePath}`)
    : fs.writeFile(filePath, doc).then(() => console.log(`[daily-trends] wrote ${filePath}`));

const guardApiKey = () => {
  const isOfficialOpenAi = new URL(API_BASE_URL).hostname === "api.openai.com";
  return !((isOfficialOpenAi && !API_KEY) && (console.log("OPENAI_API_KEY is not set for official OpenAI endpoint; skipping daily trend draft generation."), process.exit(0)));
};

const MIN_SOURCES_REQUIRED = Number.parseInt(process.env.TREND_MIN_SOURCES ?? "3", 10);

const guardMinSources = (sources) => {
  return sources.length < Math.max(1, MIN_SOURCES_REQUIRED)
    ? (console.log("Low sources, skip"), process.exit(0))
    : sources;
};

type RankedSource = {
  title: string;
  url: string;
  source: string;
  summary?: string;
};

const toRankedSource = (source: FeedItem): RankedSource => ({
  title: source.title,
  url: source.link,
  source: source.feed,
  summary: source.description,
});

const uniqueByUrl = (sources: RankedSource[]) =>
  Array.from(new Map(sources.map((item) => [item.url, item])).values());

const normalizeWord = (value: string) => value.trim().toLowerCase();

const topicHintTerms = TOPIC_HINT
  .split(/[\s,]+/)
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
        trendKeywords
      )
    )
  );
  console.log(`[daily-trends] source pool: raw=${normalized.length}, trend=${byTrend.length}`);
  if (byTrend.length >= MIN_SOURCES_REQUIRED) {
    return byTrend.slice(0, 6);
  }

  const expandedKeywords = Array.from(
    new Set([...allConfiguredKeywords, ...topicHintTerms])
  );
  const byExpanded = uniqueByUrl(
    normalized.filter((item) =>
      includesAnyKeyword(
        `${item.title} ${item.summary ?? ""}`.toLowerCase(),
        expandedKeywords
      )
    )
  );
  console.log(`[daily-trends] source pool: expanded=${byExpanded.length}`);
  if (byExpanded.length >= MIN_SOURCES_REQUIRED) {
    console.warn("[daily-trends] trend-only sources were low; using expanded keyword matching.");
    return byExpanded.slice(0, 6);
  }

  const fallbackPool = uniqueByUrl(normalized);
  console.log(`[daily-trends] source pool: fallback=${fallbackPool.length}, min_required=${Math.max(1, MIN_SOURCES_REQUIRED)}`);
  if (fallbackPool.length >= MIN_SOURCES_REQUIRED) {
    console.warn("[daily-trends] keyword-matched sources were low; using top feed items fallback.");
    return fallbackPool.slice(0, 6);
  }

  return fallbackPool;
};

const parseLangFlag = () => {
  const arg = process.argv.find((entry) => entry.startsWith("--lang="));
  if (!arg) return null;
  return arg.slice("--lang=".length).trim().toLowerCase();
};

const resolveTargetLanguages = () => {
  const selectedLang = parseLangFlag();
  if (!selectedLang) return LANGUAGE_ORDER;
  if (!LANGUAGE_ORDER.includes(selectedLang)) {
    throw new Error(`Unsupported --lang value "${selectedLang}". Use one of: ${LANGUAGE_ORDER.join(", ")}`);
  }
  return [selectedLang];
};

const VALIDATE_CONFIG_ONLY = process.argv.includes("--validate-config");

async function main() {
  guardApiKey();
  await initializeConfigs();

  const targetLanguages = resolveTargetLanguages();
  const resolvedTocConfig = loadTocConfig();
  const generateToc = createGenerateToc(resolvedTocConfig.excludedHeadings);

  if (VALIDATE_CONFIG_ONLY) {
    console.log(`[daily-trends] config validation OK (languages: ${targetLanguages.join(", ")})`);
    return;
  }

  const dateString = new Date().toISOString().slice(0, 10);
  console.log(`[daily-trends] starting ${dateString}`);

  const rawSources = (await Promise.allSettled(ConfigState.FEEDS.map(f => fetchFeed(f))))
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);

  const ranked = guardMinSources(pickRankedSources(rawSources));

  const content = await createStagedArticle({
    dateString,
    sources: ranked,
    targetLanguages
  });
  const category = ConfigState.CATEGORY_MAP.get(content.categorySlug)
    ?? ConfigState.CATEGORY_DEFINITIONS[0];

  void (!ConfigState.CATEGORY_MAP.has(content.categorySlug) && console.warn(`[daily-trends] Category slug "${content.categorySlug}" not found — falling back to "${category.slug}".`));

  const baseSlug = `ai-it-trend-brief-${dateString}-${content.slugSuffix.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const referencesSection = ranked.map(s => `- [${s.title}](${s.url})`).join("\n");

  await Promise.all(
    targetLanguages.map(async (lang) => {
      const meta = LANGUAGE_LABELS[lang];
      const finalBody = Object.values(content[lang].sections).join("\n\n");
      const toc = generateToc(finalBody, meta.tocHeading);
      const doc = [
        ...buildFrontmatter(content, { ...meta, lang }, category, dateString),
        "",
        toc,
        finalBody,
        "",
        meta.referencesHeading,
        "",
        referencesSection
      ].join("\n");

      const filePath = path.join(POSTS_DIR, `${baseSlug}${meta.fileSuffix}.mdx`);
      await writePostFile(filePath, doc);
    })
  );

  console.log(`[RUN COMPLETE] Total tokens used: ${AiState.totalTokensUsed} | Sections generated: ${Object.keys(content.en.sections).length}/${content.sections.length} | Languages: ${targetLanguages.join("/")}`);

  await flushMetrics();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
