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
const MIN_WORDS_EXCLUSIVE = 700; // Rule: strictly more than 700 words

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
    url: "https://developer.apple.com/news/rss/",
  },
  {
    name: "Apple ML Research",
    url: "https://machinelearning.apple.com/feed.xml",
  },
  {
    name: "AWS Machine Learning",
    url: "https://aws.amazon.com/blogs/machine-learning/feed/",
  },
  {
    name: "Anthropic Engineering",
    url: "https://www.anthropic.com/engineering/feed.xml",
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
    url: "https://blog.tailwindcss.com/feed.xml",
  },
  {
    name: "InfoQ (AI & Dev)",
    url: "https://www.infoq.com/feed/",
  },
  {
    name: "InfoWorld ML",
    url: "https://www.infoworld.com/category/machine-learning/index.rss",
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
    name: "Al Jazeera Tech (AR)",
    url: "https://www.aljazeera.net/xml/rss/all.xml",
  },
  {
    name: "Asharq Al-Awsat (AR)",
    url: "https://aawsat.com/feed/information-technology",
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

const CATEGORY_DEFINITIONS = [
  {
    slug: "software-development",
    nameEn: "Software Development",
    nameJa: "Software Development",
    nameAr: "Software Development",
    keywords: ["developer", "engineering", "software", "coding", "codebase", "framework", "sdk", "api"],
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
const DEFAULT_CATEGORY_SLUG = "product-strategy";

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
  if (CATEGORY_MAP.has(rawSlug)) {
    return CATEGORY_MAP.get(rawSlug);
  }

  const aggregateText = [
    content?.en?.title || "",
    content?.en?.excerpt || "",
    content?.en?.body || "",
    ...sources.map((source) => `${source.title} ${source.summary}`),
  ].join("\n");
  const heuristicCategory = scoreCategoryFromText(aggregateText);
  if (heuristicCategory) {
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
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
    const item = match[1];
    const title = extractTag(item, "title");
    const link = normalizeUrl(extractTag(item, "link"));
    const description = extractTag(item, "description");
    const pubDate = extractTag(item, "pubDate");
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
  const all = [...rssItems, ...atomEntries];

  if (all.length === 0) {
    throw new Error(`${feed.name} returned no parseable items`);
  }

  return all;
}

function hasTrendKeyword(text) {
  const haystack = text.toLowerCase();
  return TREND_KEYWORDS.some((keyword) => haystack.includes(keyword));
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

function ensureJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("Model response is not valid JSON");
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

async function callResponsesEndpoint(systemPrompt, userPrompt) {
  const response = await fetch(`${API_BASE_URL}/responses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
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

async function callChatCompletionsEndpoint(systemPrompt, userPrompt) {
  const response = await fetch(`${API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
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

async function createDraftContent({ dateString, sources }) {
  const allowedCategoryList = CATEGORY_DEFINITIONS.map((category) => category.slug).join(", ");
  const systemPrompt = [
    "You are a senior multilingual tech editor.",
    "Write high-trust, human-sounding blog content in English, Japanese, and Arabic.",
    "Do not invent facts or URLs. Use only the provided source list.",
    "No emojis. No hype. No marketing buzzwords.",
    "Keep tone practical, modern, and confident.",
    "CRITICAL: Return ONLY a valid JSON object. Do not include any explanation or text outside the JSON block.",
  ].join("\n");

  const userPrompt = [
    `Date: ${dateString}`,
    TOPIC_HINT ? `Topic hint: ${TOPIC_HINT}` : "Topic hint: none",
    "",
    "Create one multilingual trend brief with these requirements:",
    "- Theme: latest AI + IT practical trends for builders and product teams.",
    "- Provide EN/JA/AR versions aligned in meaning (not literal translation).",
    "- Each body must be more than 700 words.",
    "- Use markdown H2 headings for trend sections with this pattern: `## 1. Trend name`.",
    "- Include 3-6 trend sections, each with exact dates and concrete product/team impact.",
    "- End with a Takeaways section containing a 3-column markdown table (Trend | What It Means for Your Team | Practical Steps).",
    "- Do not use a bullet list instead of the takeaway table.",
    "- Include exact dates when mentioning events.",
    "- Do not include a references section; it will be appended automatically.",
    `- Pick exactly one category slug from this list: ${allowedCategoryList}.`,
    "",
    "Output schema:",
    "{",
    `  "categorySlug": "one of: ${allowedCategoryList}",`,
    '  "slugSuffix": "3-5 ascii words, lowercase, hyphen-separated",',
    '  "en": { "title": "...", "excerpt": "...", "body": "markdown" },',
    '  "ja": { "title": "...", "excerpt": "...", "body": "markdown" },',
    '  "ar": { "title": "...", "excerpt": "...", "body": "markdown" }',
    "}",
    "",
    "Allowed source list:",
    ...sources.map(
      (source, index) =>
        `${index + 1}. [${source.source}] ${source.title} | ${source.publishedAt} | ${source.url}\nSummary: ${source.summary}`,
    ),
  ].join("\n");

  let outputText = "";

  if (API_MODE === "responses") {
    outputText = await callResponsesEndpoint(systemPrompt, userPrompt);
  } else if (API_MODE === "chat") {
    outputText = await callChatCompletionsEndpoint(systemPrompt, userPrompt);
  } else {
    try {
      outputText = await callResponsesEndpoint(systemPrompt, userPrompt);
    } catch (error) {
      const statusCode = Number.isFinite(error?.statusCode) ? error.statusCode : 0;
      if (!shouldFallbackToChat(error?.message, statusCode)) {
        throw error;
      }
      console.warn(
        `[daily-trends] /responses unavailable on ${API_BASE_URL}; falling back to /chat/completions`,
      );
      outputText = await callChatCompletionsEndpoint(systemPrompt, userPrompt);
    }
  }

  return ensureJson(outputText);
}

function countTrendHeadings(markdownBody) {
  return (String(markdownBody).match(/^##\s*[0-9٠-٩]+\./gm) || []).length;
}

function hasMarkdownTable(markdownBody) {
  const body = String(markdownBody || "");
  return /^\|.+\|\s*$/m.test(body) && /^\|[\s:\-|]+\|\s*$/m.test(body);
}

function countWords(markdownBody) {
  return String(markdownBody || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
}

function validateDraftContent(content) {
  const languages = ["en", "ja", "ar"];

  for (const lang of languages) {
    const block = content?.[lang];
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
    const wordCount = countWords(block.body);
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
}

function buildReferencesSection(language, sources) {
  const heading =
    language === "ja"
      ? "## 参考リンク"
      : language === "ar"
        ? "## المراجع"
        : "## References";
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
}) {
  const normalizedBody = body.trim();
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

  const ranked = rankItems(dedupeByLink(sourceItems))
    .filter((item) => hasTrendKeyword(`${item.title} ${item.description}`))
    .slice(0, 12);

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

  if (!content || !content.en || !content.ja || !content.ar) {
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

  const files = [
    {
      lang: "en",
      path: path.join(POSTS_DIR, `${baseSlug}.mdx`),
      category: selectedCategory.nameEn,
      body: buildPostDocument({
        title: content.en.title,
        excerpt: content.en.excerpt,
        dateString,
        category: selectedCategory.nameEn,
        body: content.en.body,
        referencesSection: buildReferencesSection("en", selectedSources),
      }),
    },
    {
      lang: "ja",
      path: path.join(POSTS_DIR, `${baseSlug}-ja.mdx`),
      category: selectedCategory.nameJa || selectedCategory.nameEn,
      body: buildPostDocument({
        title: content.ja.title,
        excerpt: content.ja.excerpt,
        dateString,
        category: selectedCategory.nameJa || selectedCategory.nameEn,
        body: content.ja.body,
        referencesSection: buildReferencesSection("ja", selectedSources),
      }),
    },
    {
      lang: "ar",
      path: path.join(POSTS_DIR, `${baseSlug}-ar.mdx`),
      category: selectedCategory.nameAr || selectedCategory.nameEn,
      body: buildPostDocument({
        title: content.ar.title,
        excerpt: content.ar.excerpt,
        dateString,
        category: selectedCategory.nameAr || selectedCategory.nameEn,
        body: content.ar.body,
        referencesSection: buildReferencesSection("ar", selectedSources),
      }),
    },
  ];

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

main().catch((error) => {
  console.error(`[daily-trends] failed: ${error.message}`);
  process.exit(1);
});
