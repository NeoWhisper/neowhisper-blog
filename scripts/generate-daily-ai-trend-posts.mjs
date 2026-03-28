#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const API_MODE = (process.env.OPENAI_API_MODE || "auto").toLowerCase();
const COVER_IMAGE = process.env.TREND_POST_COVER_IMAGE || "/og-image.jpg";
const AUTHOR_NAME = process.env.TREND_POST_AUTHOR_NAME || "NeoWhisper";
const TOPIC_HINT = (process.env.TOPIC_HINT || "").trim();
const RAW_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const API_BASE_URL = RAW_BASE_URL.endsWith("/v1")
  ? RAW_BASE_URL.replace(/\/+$/, "")
  : `${RAW_BASE_URL.replace(/\/+$/, "")}/v1`;
const API_KEY = process.env.OPENAI_API_KEY || "sk-local";

const FORCE = process.argv.includes("--force");
const DRY_RUN = process.argv.includes("--dry-run");
const MIN_WORDS_EXCLUSIVE = 700; // strictly more than 700 words per language for quality assurance

const FEEDS = [
  {
    name: "OpenAI News",
    url: "https://openai.com/news/rss.xml",
  },
  {
    name: "Google Developer Tools",
    url: "https://blog.google/technology/developers/rss/",
  },
  {
    name: "NVIDIA Technical Blog",
    url: "https://developer.nvidia.com/blog/feed/",
  },
  {
    name: "Hacker News (AI)",
    url: "https://hnrss.org/newest?q=AI",
  },
  {
    name: "TechCrunch (AI)",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "AI News",
    url: "https://www.artificialintelligence-news.com/feed/",
  },
  {
    name: "Apple Developer News",
    url: "https://developer.apple.com/news/rss/news.rss",
  },
  {
    name: "Apple ML Research",
    url: "https://machinelearning.apple.com/rss.xml",
  },
  {
    name: "AWS Machine Learning",
    url: "https://aws.amazon.com/blogs/machine-learning/feed/",
  },
  {
    name: "React Blog",
    url: "https://react.dev/rss.xml",
  },
  {
    name: "Next.js Blog",
    url: "https://nextjs.org/feed.xml",
  },
  {
    name: "Vercel Blog",
    url: "https://vercel.com/atom",
  },
  {
    name: "Tailwind CSS Blog",
    url: "https://tailwindcss.com/blog",
  },
  {
    name: "InfoQ (AI & Dev)",
    url: "https://www.infoq.com/feed/",
  },
  {
    name: "InfoWorld ML",
    url: "https://www.infoworld.com/artificial-intelligence/",
  },
  {
    name: "Ars Technica (Biz & IT)",
    url: "https://feeds.arstechnica.com/arstechnica/index",
  },
  {
    name: "ZDNet (AI & Tech)",
    url: "https://www.zdnet.com/news/rss.xml",
  },
  {
    name: "ITmedia (JP)",
    url: "http://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml",
  },
  {
    name: "ASCII.jp (JP)",
    url: "https://ascii.jp/rss.xml",
  },
  {
    name: "Impress Watch (JP)",
    url: "https://www.watch.impress.co.jp/data/rss/1.0/ipw/feed.rdf",
  },
  {
    name: "Tech-WD (AR)",
    url: "https://www.tech-wd.com/feed",
  },
  {
    name: "AITNews (AR)",
    url: "https://aitnews.com/feed/",
  },
  {
    name: "Unlimit-Tech (AR)",
    url: "https://www.unlimit-tech.com/feed",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
  },
];

const TREND_KEYWORDS = [
  "ai",
  "artificial intelligence",
  "machine learning",
  "ml",
  "llm",
  "agent",
  "agentic",
  "model",
  "openai",
  "anthropic",
  "google",
  "microsoft",
  "meta",
  "nvidia",
  "cloud",
  "developer",
  "cybersecurity",
  "security",
  "vulnerability",
  "gpu",
  "inference",
  "api",
  "react",
  "next.js",
  "nextjs",
  "frontend",
  "typescript",
  "javascript",
  "tailwind",
  "node",
  "vercel",
  "web dev",
  "architecture",
  "devops",
  "enterprise",
  "infrastructure",
  "database",
  "scaling",
  "saas",
  "serverless",
];

const ART_KEYWORDS = [
  "design",
  "ux",
  "ui",
  "visual",
  "illustration",
  "typography",
  "creative",
  "art",
];

const POLITICS_KEYWORDS = [
  "election",
  "president",
  "minister",
  "parliament",
  "senate",
  "government",
  "congress",
  "geopolitics",
  "war",
  "conflict",
  "diplomatic",
  "sanction",
  "policy debate",
  "campaign",
  "voting",
];

const FINANCE_KEYWORDS = [
  "oil market",
  "crude oil",
  "brent",
  "wti",
  "stock market",
  "exchange rate",
  "inflation",
  "commodity",
  "barrel",
  "gas price",
  "mortgage",
  "interest rate",
];

const CATEGORY_DEFINITIONS = [
  {
    slug: "software-development",
    nameEn: "Software Development",
    nameJa: "Software Development",
    nameAr: "Software Development",
    keywords: ["developer", "engineering", "software", "coding", "codebase", "framework", "sdk", "api"],
  },
  {
    slug: "ai-ml",
    nameEn: "AI & Machine Learning",
    nameJa: "AI・機械学習",
    nameAr: "الذكاء الاصطناعي وتعلم الآلة",
    keywords: [
      "ai",
      "artificial intelligence",
      "machine learning",
      "ml",
      "llm",
      "agent",
      "agentic",
      "inference",
      "training",
      "evaluation",
      "prompt",
      "rag",
      "vector",
      "embedding",
    ],
  },
  {
    slug: "cloud-devops",
    nameEn: "Cloud & DevOps",
    nameJa: "クラウド・DevOps",
    nameAr: "السحابة و DevOps",
    keywords: [
      "cloud",
      "devops",
      "kubernetes",
      "k8s",
      "docker",
      "container",
      "serverless",
      "terraform",
      "iac",
      "ci/cd",
      "pipeline",
      "observability",
      "logging",
      "metrics",
      "tracing",
      "sre",
      "reliability",
    ],
  },
  {
    slug: "cybersecurity",
    nameEn: "Cybersecurity",
    nameJa: "サイバーセキュリティ",
    nameAr: "الأمن السيبراني",
    keywords: [
      "security",
      "cybersecurity",
      "vulnerability",
      "cve",
      "exploit",
      "auth",
      "oauth",
      "passkey",
      "mfa",
      "zero trust",
      "csp",
      "xss",
      "csrf",
      "ssrf",
      "supply chain",
    ],
  },
  {
    slug: "data-infrastructure",
    nameEn: "Data & Infrastructure",
    nameJa: "データ・インフラ",
    nameAr: "البيانات والبنية التحتية",
    keywords: [
      "database",
      "postgres",
      "mysql",
      "redis",
      "queue",
      "kafka",
      "etl",
      "warehouse",
      "lakehouse",
      "index",
      "scaling",
      "latency",
      "throughput",
      "infrastructure",
    ],
  },
  {
    slug: "game-development",
    nameEn: "Game Development",
    nameJa: "Game Development",
    nameAr: "Game Development",
    keywords: ["game", "gaming", "unity", "unreal", "rendering", "simulation"],
  },
  {
    slug: "translation",
    nameEn: "Translation",
    nameJa: "Translation",
    nameAr: "Translation",
    keywords: ["translation", "localization", "multilingual", "i18n", "l10n", "language"],
  },
  {
    slug: "next.js",
    nameEn: "Next.js Tutorials",
    nameJa: "Next.js Tutorials",
    nameAr: "Next.js Tutorials",
    keywords: ["next.js", "nextjs", "vercel", "app router", "route handlers"],
  },
  {
    slug: "typescript",
    nameEn: "TypeScript",
    nameJa: "TypeScript",
    nameAr: "TypeScript",
    keywords: ["typescript", "type safety", "types", "tsconfig", "eslint", "compiler"],
  },
  {
    slug: "tech-tips",
    nameEn: "Tech Tips",
    nameJa: "Tech Tips",
    nameAr: "Tech Tips",
    keywords: ["how to", "guide", "checklist", "debugging", "tips", "playbook", "best practices"],
  },
  {
    slug: "art-design",
    nameEn: "Art & Design",
    nameJa: "アート＆デザイン",
    nameAr: "الفن والتصميم",
    keywords: ["design", "ux", "ui", "visual", "typography", "illustration", "creative"],
  },
  {
    slug: "product-strategy",
    nameEn: "Product Strategy",
    nameJa: "プロダクト戦略",
    nameAr: "استراتيجية المنتج",
    keywords: [
      "strategy",
      "roadmap",
      "product team",
      "go to market",
      "regulation",
      "policy",
      "adoption",
      "trend",
      "impact",
    ],
  },
];

const CATEGORY_MAP = new Map(CATEGORY_DEFINITIONS.map((category) => [category.slug, category]));
const ALLOWED_CATEGORY_SLUGS = new Set([
  "software-development",
  "ai-ml",
  "cloud-devops",
  "cybersecurity",
  "data-infrastructure",
  "game-development",
  "next.js",
  "typescript",
  "tech-tips",
  "art-design",
]);
const DEFAULT_CATEGORY_SLUG = "software-development";
const DEFAULT_GENERATION_MAX_TOKENS = 5000;
const JSON_REPAIR_MAX_ATTEMPTS = 2;
const LENGTH_EXPANSION_MAX_ATTEMPTS = 2;
const MODEL_FETCH_RETRY_ATTEMPTS = 3;
const MODEL_FETCH_RETRY_DELAY_MS = 1200;
const TITLE_POLISH_MAX_ATTEMPTS = 1;
const LANGUAGE_ORDER = ["en", "ja", "ar"];
const LANGUAGE_LABELS = {
  en: {
    tocHeading: "## Table of Contents",
    referencesHeading: "## References",
    categoryNameKey: "nameEn",
    fileSuffix: "",
  },
  ja: {
    tocHeading: "## 目次",
    referencesHeading: "## 参考リンク",
    categoryNameKey: "nameJa",
    fileSuffix: "-ja",
  },
  ar: {
    tocHeading: "## المحتويات",
    referencesHeading: "## المراجع",
    categoryNameKey: "nameAr",
    fileSuffix: "-ar",
  },
};
const TRANSLATION_CONFIGS = [
  {
    lang: "ja",
    logLabel: "Japanese",
    systemPrompt: "You are a senior Japanese tech editor. Return ONLY a valid JSON object.",
    instruction: "Translate and adapt this technical blog post into Japanese.",
    bodyRequirement: "- The Japanese body must be 900-1200 words (minimum 850).",
    tone: "- Tone: professional, technical, and natural for a Japanese audience. Avoid stiff literal translation.",
  },
  {
    lang: "ar",
    logLabel: "Arabic",
    systemPrompt: "You are a senior Arabic tech editor. Return ONLY a valid JSON object.",
    instruction: "Translate and adapt this technical blog post into Arabic.",
    bodyRequirement: "- The Arabic body must be 900-1200 words (minimum 850).",
    tone:
      "- Tone: professional, technical, and natural for an Arabic audience in fluent Modern Standard Arabic. Avoid literal translation, awkward compounds, and title constructions that mirror English punctuation or '+' / '/' patterns.",
  },
];
const LANGUAGE_SEGMENTER_EXCLUSIONS = new Set(["en"]);
const API_CALLERS = {
  responses: callResponsesEndpoint,
  chat: callChatCompletionsEndpoint,
};
const HTML_FEED_EXTRACTORS = {
  "Tailwind CSS Blog": extractTailwindBlogItems,
  "InfoWorld ML": extractInfoWorldItems,
};
const TITLE_POLISH_RULES = {
  en: "Rewrite the title and excerpt to feel sharper and more specific. Avoid generic trend-roundup phrasing.",
  ja: "Rewrite the title and excerpt in natural Japanese tech-editor style. Avoid literal translation and generic roundup phrasing.",
  ar: "Rewrite the title and excerpt in fluent Modern Standard Arabic. Avoid literal translation, awkward wording, and generic roundup phrasing.",
};

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9.+\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreCategoryFromText(text) {
  const normalized = normalizeSearchText(text);
  if (!normalized) return null;

  let winner = null;
  let bestScore = 0;
  for (const category of CATEGORY_DEFINITIONS) {
    let score = 0;
    for (const keyword of category.keywords) {
      if (normalized.includes(keyword)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      winner = category;
    }
  }
  return winner;
}

function pickCategory(content, sources) {
  const rawSlug = String(content?.categorySlug || "").trim().toLowerCase();
  if (CATEGORY_MAP.has(rawSlug) && ALLOWED_CATEGORY_SLUGS.has(rawSlug)) {
    return CATEGORY_MAP.get(rawSlug);
  }

  // Category should be driven by the source mix, not by the model's already-generated
  // title/body, otherwise generic phrasing can create a self-reinforcing category loop.
  const sourceAggregateText = sources
    .map((source) => `${source.title} ${source.summary}`)
    .join("\n");
  const heuristicCategory = scoreCategoryFromText(sourceAggregateText);
  if (heuristicCategory && ALLOWED_CATEGORY_SLUGS.has(heuristicCategory.slug)) {
    return heuristicCategory;
  }
  return CATEGORY_MAP.get(DEFAULT_CATEGORY_SLUG);
}

function decodeEntities(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function stripHtml(value) {
  return decodeEntities(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block, tagName) {
  const regex = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = block.match(regex);
  return match ? stripHtml(match[1]) : "";
}

function extractAtomLink(entry) {
  const linkTag =
    entry.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"[^>]*\/?>/i) ||
    entry.match(/<link[^>]*href="([^"]+)"[^>]*\/?>/i);
  return linkTag ? decodeEntities(linkTag[1].trim()) : "";
}

function normalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    url.hash = "";
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid",
    ];
    for (const param of trackingParams) {
      url.searchParams.delete(param);
    }
    return url.toString();
  } catch {
    return rawUrl.trim();
  }
}

function parseDate(value) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseRssItems(xml, feedName) {
  const items = [];
  for (const match of xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)) {
    const item = match[1];
    const title = extractTag(item, "title");
    const link = normalizeUrl(extractTag(item, "link"));
    const description = extractTag(item, "description");
    const pubDate = extractTag(item, "pubDate") || extractTag(item, "dc:date");
    if (!title || !link) continue;
    items.push({
      feed: feedName,
      title,
      link,
      description,
      publishedAt: pubDate || "",
      publishedTimestamp: parseDate(pubDate),
    });
  }
  return items;
}

function parseAtomEntries(xml, feedName) {
  const entries = [];
  for (const match of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)) {
    const entry = match[1];
    const title = extractTag(entry, "title");
    const link = normalizeUrl(extractAtomLink(entry));
    const summary = extractTag(entry, "summary") || extractTag(entry, "content");
    const updated = extractTag(entry, "updated") || extractTag(entry, "published");
    if (!title || !link) continue;
    entries.push({
      feed: feedName,
      title,
      link,
      description: summary,
      publishedAt: updated || "",
      publishedTimestamp: parseDate(updated),
    });
  }
  return entries;
}

function extractTailwindBlogItems(html, feedName) {
  const items = [];
  for (const match of html.matchAll(/<a[^>]+href="(\/blog\/[^"#?]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const link = normalizeUrl(`https://tailwindcss.com${decodeEntities(match[1])}`);
    const title = stripHtml(match[2]);
    if (!title || !link || /^(blog|read more)$/i.test(title)) continue;
    items.push({
      feed: feedName,
      title,
      link,
      description: "",
      publishedAt: "",
      publishedTimestamp: 0,
    });
  }
  return dedupeByLink(items);
}

function extractInfoWorldItems(html, feedName) {
  const items = [];
  for (const match of html.matchAll(/<a[^>]+href="(https:\/\/www\.infoworld\.com\/article\/[^"?#]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const link = normalizeUrl(decodeEntities(match[1]));
    const title = stripHtml(match[2]);
    if (!title || !link) continue;
    items.push({
      feed: feedName,
      title,
      link,
      description: "",
      publishedAt: "",
      publishedTimestamp: 0,
    });
  }
  return dedupeByLink(items);
}

function parseHtmlFeed(html, feed) {
  const extractor = HTML_FEED_EXTRACTORS[feed.name];
  if (!extractor) return [];
  return extractor(html, feed.name);
}

async function fetchFeed(feed) {
  const response = await fetch(feed.url, {
    headers: {
      "user-agent": "NeoWhisperDailyTrendBot/1.0 (+https://www.neowhisper.net)",
      accept: "application/rss+xml, application/atom+xml, text/xml, application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`${feed.name} returned HTTP ${response.status}`);
  }

  const xml = await response.text();
  const rssItems = parseRssItems(xml, feed.name);
  const atomEntries = parseAtomEntries(xml, feed.name);
  const htmlItems = parseHtmlFeed(xml, feed);
  const all = [...rssItems, ...atomEntries, ...htmlItems];

  if (all.length === 0) {
    throw new Error(`${feed.name} returned no parseable items`);
  }

  return all;
}

function hasTrendKeyword(text) {
  const haystack = text.toLowerCase();
  return TREND_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

function hasArtKeyword(text) {
  const haystack = text.toLowerCase();
  return ART_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

function hasPoliticsKeyword(text) {
  const haystack = text.toLowerCase();
  return POLITICS_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

function hasFinanceKeyword(text) {
  const haystack = text.toLowerCase();
  return FINANCE_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

function isAllowedTopicItem(item) {
  const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  return (
    !hasPoliticsKeyword(text) &&
    !hasFinanceKeyword(text) &&
    (hasTrendKeyword(text) || hasArtKeyword(text))
  );
}

function dedupeByLink(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (seen.has(item.link)) continue;
    seen.add(item.link);
    result.push(item);
  }
  return result;
}

function rankItems(items) {
  const now = Date.now();
  return items
    .map((item) => {
      const ageHours = item.publishedTimestamp
        ? Math.max(0, (now - item.publishedTimestamp) / (1000 * 60 * 60))
        : 72;
      const recencyScore = ageHours <= 24 ? 2 : ageHours <= 72 ? 1 : 0;
      const keywordScore = hasTrendKeyword(`${item.title} ${item.description}`) ? 2 : 0;
      return {
        ...item,
        score: recencyScore + keywordScore,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.publishedTimestamp - a.publishedTimestamp;
    });
}

function compactSources(items, count) {
  return items.slice(0, count).map((item) => ({
    title: item.title,
    url: item.link,
    source: item.feed,
    publishedAt: item.publishedAt || "Unknown date",
    summary: item.description || "",
  }));
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}

function deriveTitleFromBody(markdownBody) {
  const body = String(markdownBody || "");
  const headingMatch = body.match(/^##\s*[0-9٠-٩]+\.\s+(.+)$/m);
  if (headingMatch?.[1]) {
    return headingMatch[1].trim().slice(0, 110);
  }

  const firstParagraph = body
    .split(/\r?\n/)
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .find((line) => line && !line.startsWith("|"));
  return String(firstParagraph || "").slice(0, 110).trim();
}

function deriveExcerptFromBody(markdownBody, maxLength = 240) {
  const body = String(markdownBody || "");
  const tableIndex = body.indexOf("|");
  const textBeforeTable = tableIndex >= 0 ? body.slice(0, tableIndex) : body;

  const cleanText = textBeforeTable
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleanText) return "";
  return cleanText.slice(0, maxLength).trim();
}

function normalizeLanguageBlock(lang, block, fallbackBlock = {}) {
  const incoming = block && typeof block === "object" ? block : {};
  const fallback = fallbackBlock && typeof fallbackBlock === "object" ? fallbackBlock : {};

  const body = firstNonEmpty(incoming.body, fallback.body);
  return {
    title: firstNonEmpty(
      incoming.title,
      fallback.title,
      deriveTitleFromBody(body),
      `AI & IT Trend Brief (${lang.toUpperCase()})`,
    ),
    excerpt: firstNonEmpty(incoming.excerpt, fallback.excerpt, deriveExcerptFromBody(body)),
    body,
  };
}

function ensureJson(text) {
  const raw = String(text || "").trim();

  const tryParse = (candidate) => {
    const value = String(candidate || "").trim();
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const stripCodeFences = (value) => {
    const s = String(value || "").trim();
    const fenced = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    return fenced ? fenced[1].trim() : s;
  };

  const extractObjectSlice = (value) => {
    const s = String(value || "");
    const firstBrace = s.indexOf("{");
    const lastBrace = s.lastIndexOf("}");
    return firstBrace >= 0 && lastBrace > firstBrace ? s.slice(firstBrace, lastBrace + 1) : "";
  };

  const repairCommonJsonIssues = (value) => {
    const s = String(value || "");
    // Remove trailing commas: { "a": 1, } or [1,2,]
    return s
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ");
  };

  const attemptOrder = [
    raw,
    stripCodeFences(raw),
    extractObjectSlice(raw),
    extractObjectSlice(stripCodeFences(raw)),
    repairCommonJsonIssues(raw),
    repairCommonJsonIssues(stripCodeFences(raw)),
    repairCommonJsonIssues(extractObjectSlice(raw)),
    repairCommonJsonIssues(extractObjectSlice(stripCodeFences(raw))),
  ];

  for (const attempt of attemptOrder) {
    const parsed = tryParse(attempt);
    if (parsed && typeof parsed === "object") return parsed;
  }

  const preview = raw.replace(/\s+/g, " ").slice(0, 240);
  throw new Error(`Model response is not valid JSON. Preview: ${preview}`);
}

function needsTitlePolish(lang, title) {
  const value = String(title || "").trim().toLowerCase();
  if (!value) return true;

  const patternMap = {
    en: [
      /^(latest|practical)\b/,
      /\bai\s*[+&/]\s*it\b/,
      /\btrends?\b.*\b20\d{2}\b/,
    ],
    ja: [
      /^最新/,
      /トレンド/,
      /ai\s*[+＆/&]\s*it/i,
    ],
    ar: [
      /اتجاهات/,
      /أحدث/,
      /[+/]/,
    ],
  };

  const patterns = patternMap[lang] || patternMap.en;
  return patterns.some((pattern) => pattern.test(value));
}

async function parseJsonWithRepair({
  text,
  label,
  schemaDescription,
  originalSystemPrompt,
  originalUserPrompt,
}) {
  try {
    return ensureJson(text);
  } catch (initialError) {
    let lastError = initialError;

    for (let attempt = 1; attempt <= JSON_REPAIR_MAX_ATTEMPTS; attempt += 1) {
      console.log(`[daily-trends] ${label}: repairing malformed JSON (attempt ${attempt}/${JSON_REPAIR_MAX_ATTEMPTS})...`);
      const repairSystemPrompt = [
        "You repair malformed JSON generated by another model.",
        "Return ONLY a valid JSON object.",
        "Do not add commentary or markdown fences.",
      ].join("\n");

      const repairUserPrompt = [
        `Repair this malformed JSON into the required schema: ${schemaDescription}`,
        "Preserve the original meaning and markdown body content.",
        "If the content appears truncated, finish the JSON cleanly using the provided source prompts as guidance.",
        "",
        "Original system prompt:",
        originalSystemPrompt,
        "",
        "Original user prompt:",
        originalUserPrompt,
        "",
        "Malformed model output:",
        text,
      ].join("\n");

      try {
        const repairedText = await callAi(repairSystemPrompt, repairUserPrompt, {
          maxTokens: DEFAULT_GENERATION_MAX_TOKENS,
          temperature: 0.2,
          responseFormat: { type: "json_object" },
        });
        return ensureJson(repairedText);
      } catch (repairError) {
        lastError = repairError;
      }
    }

    throw new Error(`[${label}] ${lastError?.message || initialError.message}`);
  }
}

function extractResponseText(payload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  const chunks = [];
  const outputItems = Array.isArray(payload.output) ? payload.output : [];
  for (const item of outputItems) {
    const contentItems = Array.isArray(item.content) ? item.content : [];
    for (const content of contentItems) {
      if (typeof content.text === "string" && content.text.trim()) {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join("\n").trim();
}

function sanitizeFrontmatter(value, maxLength) {
  const singleLine = String(value || "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const truncated = maxLength ? singleLine.slice(0, maxLength) : singleLine;
  return truncated.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function isOfficialOpenAiBaseUrl(baseUrl) {
  try {
    const parsed = new URL(baseUrl);
    return parsed.hostname === "api.openai.com";
  } catch {
    return false;
  }
}

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientModelFetchError(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("fetch failed") || message.includes("econnreset") || message.includes("socket hang up");
}

function shouldFallbackToChat(errorMessage, statusCode) {
  if ([400, 404, 405, 415, 422, 501].includes(statusCode)) {
    return true;
  }
  const hint = (errorMessage || "").toLowerCase();
  return (
    hint.includes("responses") ||
    hint.includes("unsupported") ||
    hint.includes("not found") ||
    hint.includes("unknown endpoint")
  );
}

function getApiCallChain() {
  const primaryCaller = API_CALLERS[API_MODE];
  if (primaryCaller) {
    return [primaryCaller];
  }
  return [API_CALLERS.responses, API_CALLERS.chat];
}

async function callResponsesEndpoint(systemPrompt, userPrompt, options = {}) {
  const {
    maxTokens = DEFAULT_GENERATION_MAX_TOKENS,
    temperature = 0.7,
  } = options;
  const response = await fetch(`${API_BASE_URL}/responses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      model: MODEL,
      temperature,
      max_output_tokens: maxTokens,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: userPrompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`responses endpoint error ${response.status}: ${errorText}`);
    error.statusCode = response.status;
    throw error;
  }

  const payload = await response.json();
  const outputText = extractResponseText(payload);
  if (!outputText) {
    throw new Error("responses endpoint returned no parseable text");
  }

  return outputText;
}

function extractChatContent(payload) {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    return content.trim();
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part.text === "string") return part.text;
        return "";
      })
      .join("\n")
      .trim();
  }
  return "";
}

async function callChatCompletionsEndpoint(systemPrompt, userPrompt, options = {}) {
  const {
    maxTokens = DEFAULT_GENERATION_MAX_TOKENS,
    temperature = 0.7,
    responseFormat = { type: "json_object" },
  } = options;
  const response = await fetch(`${API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      model: MODEL,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: responseFormat,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`chat/completions endpoint error ${response.status}: ${errorText}`);
  }

  const payload = await response.json();
  const outputText = extractChatContent(payload);
  if (!outputText) {
    throw new Error("chat/completions endpoint returned no parseable content");
  }
  return outputText;
}

async function callAi(systemPrompt, userPrompt, options = {}) {
  let lastError;

  for (let attempt = 1; attempt <= MODEL_FETCH_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const callChain = getApiCallChain();
      for (let index = 0; index < callChain.length; index += 1) {
        const caller = callChain[index];
        try {
          return await caller(systemPrompt, userPrompt, options);
        } catch (error) {
          const statusCode = Number.isFinite(error?.statusCode) ? error.statusCode : 0;
          const canTryNextCaller = index < callChain.length - 1;
          if (!canTryNextCaller || !shouldFallbackToChat(error?.message, statusCode)) {
            throw error;
          }
        }
      }
    } catch (error) {
      lastError = error;
      if (!isTransientModelFetchError(error) || attempt === MODEL_FETCH_RETRY_ATTEMPTS) {
        throw error;
      }
      console.warn(
        `[daily-trends] model request failed (${error.message}); retrying ${attempt}/${MODEL_FETCH_RETRY_ATTEMPTS - 1}...`,
      );
      await delay(MODEL_FETCH_RETRY_DELAY_MS * attempt);
    }
  }

  throw lastError;
}

async function createDraftContent({ dateString, sources }) {
  const allowedCategoryList = CATEGORY_DEFINITIONS.filter((category) =>
    ALLOWED_CATEGORY_SLUGS.has(category.slug),
  )
    .map((category) => category.slug)
    .join(", ");

  // 1. Generate Metadata and English Content
  console.log("[daily-trends] generating base metadata and English content...");
  const baseSystemPrompt = [
    "You are a senior tech editor.",
    "Return ONLY a valid JSON object.",
  ].join("\n");

  const baseUserPrompt = [
    `Date: ${dateString}`,
    TOPIC_HINT ? `Topic hint: ${TOPIC_HINT}` : "Topic hint: none",
    "",
    "Create a tech trend brief meta-info and English version:",
    "- Theme: latest AI + IT + art/design practical trends for builders and product teams.",
    "- Scope guardrail: ONLY IT/software/developer/art/design topics. Do NOT include politics/current affairs.",
    "- The title must be specific, vivid, and publication-ready, not a generic template.",
    "- Avoid bland openings like 'Latest', 'Practical', or 'AI & IT Trends' unless genuinely necessary.",
    "- Prefer a concrete angle, tension, or consequence over a broad category label.",
    "- English body must be 900-1200 words (minimum 850).",
    "- Use markdown H2 headings for trend sections: `## 1. Trend name`.",
    "- Include 3-6 trend sections with deep technical analysis.",
    "- End with a 3-column markdown table. IMPORTANT: Ensure there is at least one blank line before the table starts (Trend | What It Means for Your Team | Practical Steps).",
    `- Pick exactly one category slug from: ${allowedCategoryList}.`,
    "",
    "Output schema:",
    "{",
    '  "categorySlug": "...",',
    '  "slugSuffix": "3-5 ascii words, lowercase, hyphen-separated",',
    '  "en": { "title": "...", "excerpt": "...", "body": "markdown" }',
    "}",
    "",
    "Sources:",
    ...sources.map((s, i) => `${i + 1}. [${s.source}] ${s.title} | ${s.url}\nSummary: ${s.summary}`),
  ].join("\n");

  const baseRaw = await callAi(baseSystemPrompt, baseUserPrompt, {
    maxTokens: DEFAULT_GENERATION_MAX_TOKENS,
    temperature: 0.5,
    responseFormat: { type: "json_object" },
  });
  const baseResult = await parseJsonWithRepair({
    text: baseRaw,
    label: "base generation",
    schemaDescription: '{ "categorySlug": "...", "slugSuffix": "...", "en": { "title": "...", "excerpt": "...", "body": "markdown" } }',
    originalSystemPrompt: baseSystemPrompt,
    originalUserPrompt: baseUserPrompt,
  });
  baseResult.en = normalizeLanguageBlock("en", baseResult?.en);

  const localizedContent = { en: baseResult.en };
  const promptContextByLang = {
    en: {
      systemPrompt: baseSystemPrompt,
      userPrompt: baseUserPrompt,
    },
  };

  for (const translation of TRANSLATION_CONFIGS) {
    console.log(`[daily-trends] translating/adapting to ${translation.logLabel}...`);
    const userPrompt = [
      translation.instruction,
      translation.bodyRequirement,
      "- Maintain the exact same structure (H2 headings, takeaway table).",
      "- Ensure there is a blank line before the takeaway table for correct markdown rendering.",
      translation.tone,
      "",
      "Source (English):",
      `Title: ${baseResult.en.title}`,
      `Excerpt: ${baseResult.en.excerpt}`,
      `Body: ${baseResult.en.body}`,
      "",
      "Output schema:",
      '{ "title": "...", "excerpt": "...", "body": "markdown" }',
    ].join("\n");

    const raw = await callAi(translation.systemPrompt, userPrompt, {
      maxTokens: DEFAULT_GENERATION_MAX_TOKENS,
      temperature: 0.3,
      responseFormat: { type: "json_object" },
    });

    localizedContent[translation.lang] = await parseJsonWithRepair({
      text: raw,
      label: `${translation.logLabel.toLowerCase()} translation`,
      schemaDescription: '{ "title": "...", "excerpt": "...", "body": "markdown" }',
      originalSystemPrompt: translation.systemPrompt,
      originalUserPrompt: userPrompt,
    });
    localizedContent[translation.lang] = normalizeLanguageBlock(
      translation.lang,
      localizedContent[translation.lang],
    );
    promptContextByLang[translation.lang] = {
      systemPrompt: translation.systemPrompt,
      userPrompt,
    };
  }

  const expandedContent = {};
  for (const lang of LANGUAGE_ORDER) {
    const expandedBlock = await expandLanguageBlockIfNeeded({
      lang,
      block: localizedContent[lang],
      systemPrompt: promptContextByLang[lang].systemPrompt,
      sourcePrompt: promptContextByLang[lang].userPrompt,
    });
    expandedContent[lang] = await polishLocalizedMetadataIfNeeded({
      lang,
      block: expandedBlock,
      systemPrompt: promptContextByLang[lang].systemPrompt,
      sourcePrompt: promptContextByLang[lang].userPrompt,
    });
  }

  return {
    ...baseResult,
    ...expandedContent,
  };
}

function countTrendHeadings(markdownBody) {
  return (String(markdownBody).match(/^##\s*[0-9٠-٩]+\./gm) || []).length;
}

function hasMarkdownTable(markdownBody) {
  const body = String(markdownBody || "");
  return /^\|.+\|\s*$/m.test(body) && /^\|[\s:\-|]+\|\s*$/m.test(body);
}

function headingToId(text) {
  const raw = String(text || "").trim().toLowerCase();
  const cleaned = raw
    .replace(/[`"'’“”]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "section";
}

function buildTableOfContents(language, markdownBody) {
  const body = String(markdownBody || "");
  const items = body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^##\s*[0-9٠-٩]+\.\s+/.test(line))
    .map((line) => {
      const title = line.replace(/^##\s*/, "");
      return {
        title,
        id: headingToId(title),
      };
    });

  if (items.length < 2) return "";

  const heading = LANGUAGE_LABELS[language]?.tocHeading || LANGUAGE_LABELS.en.tocHeading;
  const lines = items.map((item) => `- [${item.title}](#${item.id})`);
  return [heading, "", ...lines, "", "---", ""].join("\n");
}

function countWords(markdownBody, lang = "en") {
  const text = String(markdownBody || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const fallbackCount = () => text.split(" ").filter(Boolean).length;

  // English words are space-delimited. Japanese/Arabic often aren't, so use
  // Intl.Segmenter to avoid undercounting (which can incorrectly fail QA).
  const segmentSupported =
    !LANGUAGE_SEGMENTER_EXCLUSIONS.has(lang) && typeof Intl !== "undefined" && Intl.Segmenter;

  return !text
    ? 0
    : segmentSupported
      ? (() => {
          try {
            const segmenter = new Intl.Segmenter(lang, { granularity: "word" });
            return Array.from(segmenter.segment(text)).filter(
              (seg) => seg?.isWordLike && String(seg.segment || "").trim(),
            ).length;
          } catch {
            return fallbackCount();
          }
        })()
      : fallbackCount();
}

function validateLanguageBlock(lang, block) {
  if (!block || typeof block !== "object") {
    throw new Error(`Model output missing language block: ${lang}`);
  }

  if (!String(block.title || "").trim()) {
    throw new Error(`Model output missing ${lang}.title`);
  }
  if (!String(block.excerpt || "").trim()) {
    throw new Error(`Model output missing ${lang}.excerpt`);
  }
  if (!String(block.body || "").trim()) {
    throw new Error(`Model output missing ${lang}.body`);
  }

  const headingCount = countTrendHeadings(block.body);
  const wordCount = countWords(block.body, lang);
  if (headingCount < 3) {
    throw new Error(
      `Model output for ${lang}.body has ${headingCount} trend headings; expected at least 3 with '## 1.' style.`,
    );
  }
  if (wordCount <= MIN_WORDS_EXCLUSIVE) {
    throw new Error(
      `Model output for ${lang}.body has ${wordCount} words; expected more than ${MIN_WORDS_EXCLUSIVE}.`,
    );
  }
  if (!hasMarkdownTable(block.body)) {
    throw new Error(`Model output for ${lang}.body is missing a markdown takeaway table.`);
  }
}

function validateDraftContent(content) {
  for (const lang of LANGUAGE_ORDER) {
    validateLanguageBlock(lang, content?.[lang]);
  }
}

async function expandLanguageBlockIfNeeded({ lang, block, systemPrompt, sourcePrompt }) {
  let currentBlock = block;

  for (let attempt = 0; attempt <= LENGTH_EXPANSION_MAX_ATTEMPTS; attempt += 1) {
    try {
      validateLanguageBlock(lang, currentBlock);
      return currentBlock;
    } catch (error) {
      if (attempt === LENGTH_EXPANSION_MAX_ATTEMPTS) {
        throw error;
      }

      const currentWordCount = countWords(currentBlock?.body || "", lang);
      console.log(
        `[daily-trends] ${lang}: expanding under-length or invalid draft (attempt ${attempt + 1}/${LENGTH_EXPANSION_MAX_ATTEMPTS})...`,
      );

      const expandSystemPrompt = [
        systemPrompt,
        "You are revising an existing draft to satisfy structural and length requirements.",
        "Return ONLY a valid JSON object.",
      ].join("\n");

      const expandUserPrompt = [
        sourcePrompt,
        "",
        `The current ${lang} draft did not pass validation: ${error.message}`,
        `Current estimated word count: ${currentWordCount}.`,
        `Revise and expand it so the body is comfortably above ${MIN_WORDS_EXCLUSIVE} words while preserving the same topic and structure.`,
        "Keep at least 3 `## 1.` style trend sections and end with the markdown takeaway table.",
        "Ensure there is a blank line before the takeaway table.",
        "Strengthen analysis with more technical detail, practical implications, and actionable recommendations.",
        "",
        "Current draft JSON:",
        JSON.stringify(currentBlock),
      ].join("\n");

      const expandedRaw = await callAi(expandSystemPrompt, expandUserPrompt, {
        maxTokens: DEFAULT_GENERATION_MAX_TOKENS,
        temperature: 0.3,
        responseFormat: { type: "json_object" },
      });

      const previousBlock = currentBlock;
      currentBlock = await parseJsonWithRepair({
        text: expandedRaw,
        label: `${lang} expansion`,
        schemaDescription: '{ "title": "...", "excerpt": "...", "body": "markdown" }',
        originalSystemPrompt: expandSystemPrompt,
        originalUserPrompt: expandUserPrompt,
      });
      currentBlock = normalizeLanguageBlock(lang, currentBlock, previousBlock);
    }
  }

  return currentBlock;
}

async function polishLocalizedMetadataIfNeeded({ lang, block, systemPrompt, sourcePrompt }) {
  let currentBlock = block;

  for (let attempt = 0; attempt < TITLE_POLISH_MAX_ATTEMPTS; attempt += 1) {
    if (!needsTitlePolish(lang, currentBlock?.title)) {
      return currentBlock;
    }

    console.log(`[daily-trends] ${lang}: polishing generic title/excerpt...`);
    const polishSystemPrompt = [
      systemPrompt,
      "You are revising only the title and excerpt for editorial quality.",
      "Return ONLY a valid JSON object.",
    ].join("\n");

    const polishUserPrompt = [
      sourcePrompt,
      "",
      TITLE_POLISH_RULES[lang] || TITLE_POLISH_RULES.en,
      "Keep the body unchanged.",
      "Do not make the title vague. Make it specific and natural.",
      "",
      "Current draft JSON:",
      JSON.stringify(currentBlock),
      "",
      'Return schema: { "title": "...", "excerpt": "...", "body": "markdown" }',
    ].join("\n");

    const polishedRaw = await callAi(polishSystemPrompt, polishUserPrompt, {
      maxTokens: DEFAULT_GENERATION_MAX_TOKENS,
      temperature: 0.3,
      responseFormat: { type: "json_object" },
    });

    const previousBlock = currentBlock;
    currentBlock = await parseJsonWithRepair({
      text: polishedRaw,
      label: `${lang} title polish`,
      schemaDescription: '{ "title": "...", "excerpt": "...", "body": "markdown" }',
      originalSystemPrompt: polishSystemPrompt,
      originalUserPrompt: polishUserPrompt,
    });
    currentBlock = normalizeLanguageBlock(lang, currentBlock, previousBlock);
  }

  return currentBlock;
}

function buildReferencesSection(language, sources) {
  const heading = LANGUAGE_LABELS[language]?.referencesHeading || LANGUAGE_LABELS.en.referencesHeading;
  const lines = sources.map((source) => `- [${source.title}](${source.url})`);
  return [heading, "", ...lines].join("\n");
}

function buildPostDocument({
  title,
  excerpt,
  dateString,
  category,
  body,
  referencesSection,
  language,
}) {
  const normalizedBody = body.trim();
  const toc = buildTableOfContents(language, normalizedBody);
  return [
    "---",
    `title: "${sanitizeFrontmatter(title, 120)}"`,
    `date: "${dateString}"`,
    `excerpt: "${sanitizeFrontmatter(excerpt, 220)}"`,
    `category: "${category}"`,
    `coverImage: "${COVER_IMAGE}"`,
    "author:",
    `  name: "${AUTHOR_NAME}"`,
    '  picture: "/images/author.png"',
    "---",
    "",
    toc,
    normalizedBody,
    "",
    "---",
    "",
    referencesSection,
    "",
  ].join("\n");
}

async function chooseBaseSlug(dateString, slugSuffix) {
  const safeSuffix = slugify(slugSuffix || "daily");
  const base = `ai-it-trend-brief-${dateString}-${safeSuffix || "daily"}`;
  let candidate = base;
  let counter = 2;

  while (true) {
    const enPath = path.join(POSTS_DIR, `${candidate}.mdx`);
    try {
      await fs.access(enPath);
      if (!FORCE) {
        return null;
      }
      candidate = `${base}-v${counter}`;
      counter += 1;
    } catch {
      return candidate;
    }
  }
}

async function main() {
  if (!process.env.OPENAI_API_KEY && isOfficialOpenAiBaseUrl(API_BASE_URL)) {
    console.log(
      "OPENAI_API_KEY is not set for official OpenAI endpoint; skipping daily trend draft generation.",
    );
    process.exit(0);
  }

  console.log(`[daily-trends] model endpoint: ${API_BASE_URL} (mode=${API_MODE}, model=${MODEL})`);

  const now = new Date();
  const dateString = now.toISOString().slice(0, 10);
  console.log(`[daily-trends] collecting sources for ${dateString}`);

  const settled = await Promise.allSettled(FEEDS.map((feed) => fetchFeed(feed)));
  const sourceItems = [];

  settled.forEach((result, index) => {
    const feed = FEEDS[index];
    if (result.status === "fulfilled") {
      console.log(`[daily-trends] ${feed.name}: ${result.value.length} items`);
      sourceItems.push(...result.value);
    } else {
      console.warn(`[daily-trends] ${feed.name} failed: ${result.reason.message}`);
    }
  });

  const ranked = rankItems(dedupeByLink(sourceItems)).filter((item) => isAllowedTopicItem(item)).slice(0, 12);

  if (ranked.length < 4) {
    console.log("[daily-trends] not enough relevant sources found; skipping post generation.");
    process.exit(0);
  }

  const selectedSources = compactSources(ranked, 6);
  console.log(`[daily-trends] selected ${selectedSources.length} sources`);

  const content = await createDraftContent({
    dateString,
    sources: selectedSources,
  });

  if (!content || LANGUAGE_ORDER.some((lang) => !content[lang])) {
    throw new Error("Model output is missing required language blocks");
  }
  validateDraftContent(content);
  const selectedCategory =
    pickCategory(content, selectedSources) ||
    CATEGORY_MAP.get(DEFAULT_CATEGORY_SLUG) ||
    CATEGORY_DEFINITIONS[0];
  const selectedCategorySlug = selectedCategory.slug || DEFAULT_CATEGORY_SLUG;
  console.log(`[daily-trends] selected category: ${selectedCategorySlug}`);

  const baseSlug = await chooseBaseSlug(dateString, content.slugSuffix);
  if (!baseSlug) {
    console.log("[daily-trends] today's post already exists; skipping (use --force to create a variant).");
    process.exit(0);
  }

  const files = LANGUAGE_ORDER.map((lang) => {
    const languageMeta = LANGUAGE_LABELS[lang] || LANGUAGE_LABELS.en;
    const category = selectedCategory[languageMeta.categoryNameKey] || selectedCategory.nameEn;
    const localizedBlock = content[lang];

    return {
      lang,
      path: path.join(POSTS_DIR, `${baseSlug}${languageMeta.fileSuffix}.mdx`),
      category,
      body: buildPostDocument({
        title: localizedBlock.title,
        excerpt: localizedBlock.excerpt,
        dateString,
        category,
        body: localizedBlock.body,
        referencesSection: buildReferencesSection(lang, selectedSources),
        language: lang,
      }),
    };
  });

  if (DRY_RUN) {
    console.log(`[daily-trends] dry run completed for slug: ${baseSlug}`);
    for (const file of files) {
      console.log(`- ${file.path}`);
    }
    process.exit(0);
  }

  for (const file of files) {
    await fs.writeFile(file.path, file.body, "utf8");
    console.log(`[daily-trends] wrote ${path.relative(process.cwd(), file.path)}`);
  }

  console.log(`[daily-trends] done. base slug: ${baseSlug}`);
}

main().catch((err) => {
  console.error(`[daily-trends] failed: ${err.message}`);
  process.exit(1);
});
