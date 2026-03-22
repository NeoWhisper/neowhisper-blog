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
];

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
  const systemPrompt = [
    "You are a senior multilingual tech editor.",
    "Write high-trust, human-sounding blog content in English, Japanese, and Arabic.",
    "Do not invent facts or URLs. Use only the provided source list.",
    "No emojis. No hype. No marketing buzzwords.",
    "Keep tone practical, modern, and confident.",
    "Return JSON only.",
  ].join("\n");

  const userPrompt = [
    `Date: ${dateString}`,
    TOPIC_HINT ? `Topic hint: ${TOPIC_HINT}` : "Topic hint: none",
    "",
    "Create one multilingual trend brief with these requirements:",
    "- Theme: latest AI + IT practical trends for builders and product teams.",
    "- Provide EN/JA/AR versions aligned in meaning (not literal translation).",
    "- Each body should be 500-800 words, with clear section headings and concrete takeaways.",
    "- Include exact dates when mentioning events.",
    "- Do not include a references section; it will be appended automatically.",
    "",
    "Output schema:",
    "{",
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

  const baseSlug = await chooseBaseSlug(dateString, content.slugSuffix);
  if (!baseSlug) {
    console.log("[daily-trends] today's post already exists; skipping (use --force to create a variant).");
    process.exit(0);
  }

  const files = [
    {
      lang: "en",
      path: path.join(POSTS_DIR, `${baseSlug}.mdx`),
      category: "Product Strategy",
      body: buildPostDocument({
        title: content.en.title,
        excerpt: content.en.excerpt,
        dateString,
        category: "Product Strategy",
        body: content.en.body,
        referencesSection: buildReferencesSection("en", selectedSources),
      }),
    },
    {
      lang: "ja",
      path: path.join(POSTS_DIR, `${baseSlug}-ja.mdx`),
      category: "プロダクト戦略",
      body: buildPostDocument({
        title: content.ja.title,
        excerpt: content.ja.excerpt,
        dateString,
        category: "プロダクト戦略",
        body: content.ja.body,
        referencesSection: buildReferencesSection("ja", selectedSources),
      }),
    },
    {
      lang: "ar",
      path: path.join(POSTS_DIR, `${baseSlug}-ar.mdx`),
      category: "استراتيجية المنتج",
      body: buildPostDocument({
        title: content.ar.title,
        excerpt: content.ar.excerpt,
        dateString,
        category: "استراتيجية المنتج",
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
