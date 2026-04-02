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
  initializeConfigs,
  ConfigState,
} from "./lib/config";
import { fetchFeed } from "./lib/feed";
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

const guardMinSources = (sources) => {
  return sources.length < 3 ? (console.log("Low sources, skip"), process.exit(0)) : sources;
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

  const ranked = guardMinSources(
    rawSources
      .filter(s => ConfigState.KEYWORDS.trend.some(k => s.title.toLowerCase().includes(k)))
      .slice(0, 6)
      .map(s => ({ title: s.title, url: s.link, source: s.feed, summary: s.description }))
  );

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
