#!/usr/bin/env node

/**
 * NeoWhisper Daily Trend Generator
 * Staged Pipeline Version (Refactored for AdSense Quality & Maintainability)
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  API_BASE_URL,
  DRY_RUN,
  POSTS_DIR,
  COVER_IMAGE,
  AUTHOR_NAME,
  initializeConfigs,
  ConfigState,
  isOfficialOpenAiBaseUrl
} from "./lib/config.mjs";
import { fetchFeed } from "./lib/feed.mjs";
import { AiState } from "./lib/ai.mjs";
import { flushMetrics } from "./lib/metrics.mjs";
import { createStagedArticle } from "./lib/article-builder.mjs";
import { LANGUAGE_ORDER, LANGUAGE_LABELS } from "./lib/constants.mjs";

function yamlString(value) {
  // Use JSON.stringify to escape backslashes, quotes, and control characters,
  // then strip the surrounding quotes so it can be embedded inside "..."
  const json = JSON.stringify(String(value));
  return json.slice(1, -1);
}

async function main() {
  if (!process.env.OPENAI_API_KEY && isOfficialOpenAiBaseUrl(API_BASE_URL)) {
    console.log("OPENAI_API_KEY is not set for official OpenAI endpoint; skipping daily trend draft generation.");
    process.exit(0);
  }

  await initializeConfigs();
  const dateString = new Date().toISOString().slice(0, 10);
  console.log(`[daily-trends] starting ${dateString}`);

  const rawSources = (await Promise.allSettled(ConfigState.FEEDS.map(f => fetchFeed(f))))
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);

  const ranked = rawSources
    .filter(s => ConfigState.KEYWORDS.trend.some(k => s.title.toLowerCase().includes(k)))
    .slice(0, 6)
    .map(s => ({ title: s.title, url: s.link, source: s.feed, summary: s.description }));

  if (ranked.length < 3) return console.log("Low sources, skip");

  const content = await createStagedArticle({ dateString, sources: ranked });
  const category = ConfigState.CATEGORY_MAP.get(content.categorySlug) ?? ConfigState.CATEGORY_DEFINITIONS[0];
  if (!ConfigState.CATEGORY_MAP.has(content.categorySlug)) {
    console.warn(`[daily-trends] Category slug "${content.categorySlug}" not found in categories.json — falling back to "${category.slug}".`);
  }
  const baseSlug = `ai-it-trend-brief-${dateString}-${content.slugSuffix.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  for (const lang of LANGUAGE_ORDER) {
    const meta = LANGUAGE_LABELS[lang];
    const finalBody = Object.values(content[lang].sections).join("\n\n");
    const doc = [
      "---",
      `title: "${yamlString(content[lang].title)}"`,
      `date: "${dateString}"`,
      `excerpt: "${yamlString(content[lang].excerpt)}"`,
      `category: "${category[meta.categoryNameKey]}"`,
      `coverImage: "${COVER_IMAGE}"`,
      "author:",
      `  name: "${AUTHOR_NAME}"`,
      '  picture: "/images/author.png"',
      "---",
      "",
      finalBody,
      "",
      meta.referencesHeading,
      "",
      ranked.map(s => `- [${s.title}](${s.url})`).join("\n")
    ].join("\n");

    const filePath = path.join(POSTS_DIR, `${baseSlug}${meta.fileSuffix}.mdx`);
    if (DRY_RUN) {
      console.log(`[DRY RUN] ${filePath}`);
    } else {
      await fs.writeFile(filePath, doc);
      console.log(`[daily-trends] wrote ${filePath}`);
    }
  }

  console.log(`[RUN COMPLETE] Total tokens used: ${AiState.totalTokensUsed} | Sections generated: ${Object.keys(content.en.sections).length}/${content.sections.length} | Languages: en/ja/ar`);

  await flushMetrics();
}

main().catch(console.error);
