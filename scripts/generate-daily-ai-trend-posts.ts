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
import { slugify } from "../src/lib/slugs";

import {
  API_BASE_URL,
  API_KEY,
  DRY_RUN,
  POSTS_DIR,
  COVER_IMAGE,
  AUTHOR_NAME,
  TOPIC_HINT,
  MODEL,
  initializeConfigs,
  ConfigState,
} from "./lib/config";
import { fetchFeed } from "./lib/feed";
import type { FeedItem } from "./lib/feed";
import { AiState } from "./lib/ai";
import { flushMetrics } from "./lib/metrics";
import {
  createStagedArticle,
  loadRecentTopics,
  shouldSkipTopic,
  loadRecentPosts,
  shouldSkipSource,
} from "./lib/article-builder";
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

const headingToAnchor = (text: string): string => slugify(text);

const createShouldExcludeHeading =
  (excludedHeadings: string[]) => (text: string) =>
    excludedHeadings.some((excluded) => text.toLowerCase().includes(excluded));

const sanitizeTocText = (text: string): string => {
  // Remove newlines, limit length, clean up for TOC display
  return text
    .replace(/\\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
};

const createGenerateToc = (excludedHeadings: string[]) => {
  const shouldExclude = createShouldExcludeHeading(excludedHeadings);
  return (markdownBody: string, tocHeading: string): string => {
    // Match H2 and H3 headings - only first line of heading
    const headings = [...markdownBody.matchAll(/^(#{2,3})\s+([^\n]+)/gm)]
      .map((match: RegExpMatchArray) => ({
        depth: match[1].length,
        text: sanitizeTocText(match[2] ?? ""),
      }))
      .filter((h) => !shouldExclude(h.text) && h.text.length > 0)
      .map((h) => ({
        ...h,
        anchor: headingToAnchor(h.text),
      }));

    if (headings.length === 0) return "";

    const tocLines = headings.map((h) => {
      const indent = h.depth === 3 ? "  " : "";
      return `${indent}- [${h.text}](#${h.anchor})`;
    });

    return `${tocHeading}\n\n${tocLines.join("\n")}\n\n---\n\n`;
  };
};

type FrontmatterInput = {
  title: string;
  excerpt: string;
  categoryName: string;
  dateString: string;
  coverImage: string;
  qualityScore: number;
  sources: string[];
};

const buildFrontmatter = ({
  title,
  excerpt,
  categoryName,
  dateString,
  coverImage,
  qualityScore,
  sources,
}: FrontmatterInput): string[] => [
  "---",
  `title: "${yamlString(title)}"`,
  `date: "${dateString}"`,
  `excerpt: "${yamlString(excerpt)}"`,
  `category: "${categoryName}"`,
  `coverImage: "${coverImage}"`,
  `qualityScore: ${qualityScore}`,
  "sources:",
  ...sources.map((s) => `  - "${yamlString(s)}"`),
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

type QualityBreakdown = {
  score: number;
  readabilityScore: number;
  structureScore: number;
  seoScore: number;
  lengthScore: number;
  avgSentenceLength: number;
  headingCount: number;
  listCount: number;
  linkCount: number;
  wordCount: number;
};

type QaIssue = {
  level: "error" | "warn";
  code:
    | "LOW_SCORE"
    | "TOC_ANCHOR_MISMATCH"
    | "MIDDLE_DOT_BULLETS"
    | "TLDR_FORMAT"
    | "CROSS_LANGUAGE_ARTIFACT"
    | "UNSOURCED_EXACT_CLAIM";
  message: string;
};

type QaResult = {
  pass: boolean;
  issues: QaIssue[];
};

type PreparedVariant = {
  lang: LanguageCode;
  finalBody: string;
  toc: string;
  title: string;
  excerpt: string;
  quality: QualityBreakdown;
};

const QA_MIN_SCORE = Number.parseInt(
  process.env.CONTENT_QA_MIN_SCORE ?? "70",
  10,
);
const QA_STRICT = (process.env.CONTENT_QA_STRICT ?? "true") !== "false";

// Content quality scoring (Phase 3)
const calculateQualityBreakdown = (content: string): QualityBreakdown => {
  const metrics = {
    // Readability: penalize long sentences
    avgSentenceLength:
      content.split(/[.!?]/).reduce((sum, s) => sum + s.length, 0) /
      content.split(/[.!?]/).length,
    // Structure: reward headings and lists
    hasHeadings: (content.match(/^#{2,3}\s/gm) || []).length,
    hasLists: (content.match(/^-\s/gm) || []).length,
    // SEO: reward internal links and proper formatting
    internalLinks: (content.match(/\[.*?\]\(.*?\)/g) || []).length,
    wordCount: content.split(/\s+/).length,
  };

  // Score 0-100 based on metrics
  const readabilityScore = Math.max(
    0,
    30 - Math.min(30, metrics.avgSentenceLength / 10),
  );
  const structureScore = Math.min(
    30,
    metrics.hasHeadings * 5 + metrics.hasLists * 2,
  );
  const seoScore = Math.min(20, metrics.internalLinks * 5);
  const lengthScore =
    metrics.wordCount >= 800 ? 20 : (metrics.wordCount / 800) * 20;

  return {
    score: Math.round(
      readabilityScore + structureScore + seoScore + lengthScore,
    ),
    readabilityScore,
    structureScore,
    seoScore,
    lengthScore,
    avgSentenceLength: metrics.avgSentenceLength,
    headingCount: metrics.hasHeadings,
    listCount: metrics.hasLists,
    linkCount: metrics.internalLinks,
    wordCount: metrics.wordCount,
  };
};

// Audit trail logging (Phase 3)
const AUDIT_LOG_PATH = path.join(
  process.cwd(),
  "scripts/logs/content-audit.log",
);
const QA_LOG_PATH = path.join(process.cwd(), "scripts/logs/content-qa.log");

const headingAnchors = (body: string): Set<string> =>
  new Set(
    [...body.matchAll(/^(#{2,3})\s+([^\n]+)/gm)].map((match) =>
      headingToAnchor((match[2] ?? "").trim()),
    ),
  );

const tocAnchors = (toc: string): Set<string> =>
  new Set(
    [...toc.matchAll(/\[[^\]]+\]\(#([^)]+)\)/g)].map((match) =>
      (match[1] ?? "").trim(),
    ),
  );

const findUnsourcedExactClaims = (
  body: string,
  sources: RankedSource[],
): string[] => {
  const sourceText = sources
    .map((s) => `${s.title} ${s.summary ?? ""}`.toLowerCase())
    .join(" ");
  const claims = [
    ...body.matchAll(
      /\b\d+(?:\.\d+)?\s?(?:%|ms|s|seconds?|minutes?|hours?|k|m|b|users?|requests?)\b/gi,
    ),
  ].map((match) => (match[0] ?? "").trim());
  return [...new Set(claims)].filter(
    (claim) => claim && !sourceText.includes(claim.toLowerCase()),
  );
};

const hasCrossLanguageArtifact = (lang: LanguageCode, body: string): boolean => {
  if (lang === "ar") return /[\u3040-\u30ff\u4e00-\u9fff]/u.test(body);
  if (lang === "ja") return /[\u0600-\u06ff]/u.test(body);
  return false;
};

const runDeterministicQa = (
  variant: PreparedVariant,
  sourcePool: RankedSource[],
): QaResult => {
  const issues: QaIssue[] = [];
  const anchorsInBody = headingAnchors(variant.finalBody);
  const anchorsInToc = tocAnchors(variant.toc);
  const missingAnchors = [...anchorsInToc].filter(
    (anchor) => !anchorsInBody.has(anchor),
  );

  if (missingAnchors.length > 0) {
    issues.push({
      level: "error",
      code: "TOC_ANCHOR_MISMATCH",
      message: `TOC anchors missing in body: ${missingAnchors.join(", ")}`,
    });
  }

  if (variant.finalBody.includes("•")) {
    issues.push({
      level: "error",
      code: "MIDDLE_DOT_BULLETS",
      message: "Found forbidden middle-dot bullets (•). Use hyphens (-).",
    });
  }

  if (
    variant.finalBody.includes('<Callout type="tldr">') &&
    !/<Callout type="tldr">\n\n- /m.test(variant.finalBody)
  ) {
    issues.push({
      level: "warn",
      code: "TLDR_FORMAT",
      message: "TL;DR callout format does not match expected style.",
    });
  }

  if (hasCrossLanguageArtifact(variant.lang, variant.finalBody)) {
    issues.push({
      level: "error",
      code: "CROSS_LANGUAGE_ARTIFACT",
      message: `Detected cross-language artifact in ${variant.lang} output.`,
    });
  }

  const unsourcedClaims = findUnsourcedExactClaims(variant.finalBody, sourcePool);
  if (unsourcedClaims.length > 0) {
    issues.push({
      level: "warn",
      code: "UNSOURCED_EXACT_CLAIM",
      message: `Potential unsourced exact claims: ${unsourcedClaims.slice(0, 5).join(", ")}`,
    });
  }

  if (variant.quality.score < QA_MIN_SCORE) {
    issues.push({
      level: "error",
      code: "LOW_SCORE",
      message: `Quality score ${variant.quality.score} is below threshold ${QA_MIN_SCORE}.`,
    });
  }

  return { pass: issues.every((issue) => issue.level !== "error"), issues };
};

const appendAuditLog = async (entry: {
  timestamp: string;
  slug: string;
  languages: string[];
  qualityScore: number;
  sources: string[];
  scoreBreakdownByLanguage?: Record<string, QualityBreakdown>;
  qaByLanguage?: Record<string, QaResult>;
  tokensUsed: number;
  model: string;
}): Promise<void> => {
  const logLine = JSON.stringify(entry) + "\n";
  await fs.mkdir(path.dirname(AUDIT_LOG_PATH), { recursive: true }).catch(() => {
    // Intentionally ignore logging setup failures.
  });
  await fs.appendFile(AUDIT_LOG_PATH, logLine).catch(() => {});
};

const appendQaLog = async (entry: {
  timestamp: string;
  slug: string;
  qaByLanguage: Record<string, QaResult>;
}): Promise<void> => {
  const logLine = JSON.stringify(entry) + "\n";
  await fs.mkdir(path.dirname(QA_LOG_PATH), { recursive: true }).catch(() => {
    // Intentionally ignore logging setup failures.
  });
  await fs.appendFile(QA_LOG_PATH, logLine).catch(() => {});
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

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

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
    return shuffleArray(byTrend).slice(0, 6);
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
    return shuffleArray(byExpanded).slice(0, 6);
  }

  const fallbackPool = uniqueByUrl(normalized);
  console.log(
    `[daily-trends] source pool: fallback=${fallbackPool.length}, min_required=${Math.max(1, MIN_SOURCES_REQUIRED)}`,
  );
  if (fallbackPool.length >= MIN_SOURCES_REQUIRED) {
    console.warn(
      "[daily-trends] keyword-matched sources were low; using top feed items fallback.",
    );
    return shuffleArray(fallbackPool).slice(0, 6);
  }

  return shuffleArray(fallbackPool);
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

  // Load recent topics to avoid repetition
  const recentTopics = await loadRecentTopics();
  console.log(
    `[dedup] recent topics: ${[...recentTopics].join(", ") || "none"}`,
  );

  // Load recent posts for aggressive cross-post dedup
  const recentPosts = await loadRecentPosts();
  console.log(
    `[dedup] recent posts (${recentPosts.length}): ${
      recentPosts
        .map((p) => p.title)
        .slice(0, 4)
        .join(", ") || "none"
    }`,
  );

  const rawSources = (
    await Promise.allSettled(ConfigState.FEEDS.map((f) => fetchFeed(f)))
  )
    .filter(
      (r): r is PromiseFulfilledResult<FeedItem[]> => r.status === "fulfilled",
    )
    .flatMap((r) => r.value);

  // Filter out sources that match recent topics or are too similar to recent posts
  const filteredSources = rawSources.filter(
    (source) =>
      !shouldSkipTopic(source.title, recentTopics) &&
      !shouldSkipSource(source.title, source.description ?? "", recentPosts),
  );
  console.log(
    `[dedup] filtered sources: ${rawSources.length} -> ${filteredSources.length}`,
  );

  const baseRanked = pickRankedSources(filteredSources);
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
    recentTopics,
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

  const preparedVariants = targetLanguages.map((lang: LanguageCode) => {
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
    const quality = calculateQualityBreakdown(finalBody);

    return {
      lang,
      finalBody,
      toc,
      title,
      excerpt,
      quality,
    } satisfies PreparedVariant;
  });

  const enVariant =
    preparedVariants.find((variant) => variant.lang === "en") ??
    preparedVariants[0];

  const canonicalRefs = ranked.filter((source) => {
    const bodyLower = enVariant.finalBody.toLowerCase();
    return (
      bodyLower.includes(source.title.toLowerCase().split(" ").slice(0, 3).join(" ")) ||
      bodyLower.includes(new URL(source.url).hostname.toLowerCase())
    );
  });
  const finalCanonicalRefs =
    canonicalRefs.length > 0 ? canonicalRefs : ranked.slice(0, 2);
  const canonicalSourceUrls = finalCanonicalRefs.map((ref) => ref.url);

  const qaByLanguage: Record<string, QaResult> = {};
  const scoreBreakdownByLanguage: Record<string, QualityBreakdown> = {};

  for (const variant of preparedVariants) {
    scoreBreakdownByLanguage[variant.lang] = variant.quality;
    qaByLanguage[variant.lang] = runDeterministicQa(variant, ranked);
  }

  const failedLanguages = Object.entries(qaByLanguage)
    .filter(([, result]) => !result.pass)
    .map(([lang]) => lang);

  if (failedLanguages.length > 0) {
    await appendQaLog({
      timestamp: new Date().toISOString(),
      slug: baseSlug,
      qaByLanguage,
    });
    if (QA_STRICT) {
      throw new Error(
        `CONTENT_QA_STRICT gate failed for languages: ${failedLanguages.join(", ")}. See scripts/logs/content-qa.log`,
      );
    }
    console.warn(
      `[daily-trends] QA gate reported blocking issues for: ${failedLanguages.join(", ")} (continuing because CONTENT_QA_STRICT=false)`,
    );
  }

  await Promise.all(
    preparedVariants.map(async (variant) => {
      const meta = LANGUAGE_LABELS[variant.lang];
      const referencesSection = finalCanonicalRefs
        .map(
          (source) => `- [${sanitizeGeneratedMarkdown(source.title)}](${source.url})`,
        )
        .join("\n");

      const doc = sanitizeGeneratedMarkdown(
        [
          ...buildFrontmatter({
            title: variant.title,
            excerpt: variant.excerpt,
            categoryName: getCategoryDisplayName(category, variant.lang),
            dateString,
            coverImage,
            qualityScore: variant.quality.score,
            sources: canonicalSourceUrls,
          }),
          "",
          variant.toc,
          variant.finalBody,
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

  // Calculate overall quality score (average across all languages)
  const overallQualityScore = Math.round(
    preparedVariants.reduce((sum, variant) => sum + variant.quality.score, 0) /
      preparedVariants.length,
  );

  // Append audit trail entry (Phase 3 compliance)
  await appendAuditLog({
    timestamp: new Date().toISOString(),
    slug: baseSlug,
    languages: targetLanguages,
    qualityScore: overallQualityScore,
    sources: canonicalSourceUrls,
    scoreBreakdownByLanguage,
    qaByLanguage,
    tokensUsed: AiState.totalTokensUsed,
    model: MODEL,
  });

  console.log(
    `[RUN COMPLETE] Total tokens used: ${AiState.totalTokensUsed} | Quality Score: ${overallQualityScore}/100 | Sections generated: ${Object.keys(content.en.sections).length}/${content.sections.length} | Languages: ${targetLanguages.join("/")}`,
  );

  await flushMetrics();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
