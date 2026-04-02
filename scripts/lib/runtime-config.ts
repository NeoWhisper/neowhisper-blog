import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { z } from "zod";
import { feeds as feedConfig, type FeedConfig } from "../config/feeds";
import {
  categories as categoryConfig,
  type CategoryConfig
} from "../config/categories";
import { keywords as keywordConfig, type KeywordBuckets } from "../config/keywords";

const DOTENV_PATH = path.join(process.cwd(), ".env.local");
const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

if (fs.existsSync(DOTENV_PATH) && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(DOTENV_PATH);
}

const FeedItemSchema = z.object({
  name: z.string().min(1),
  url: z.string().url()
});

const CategorySchema = z.object({
  slug: z.string().min(1),
  nameEn: z.string().min(1),
  nameJa: z.string().min(1),
  nameAr: z.string().min(1),
  keywords: z.array(z.string()).default([])
});

const KeywordsSchema = z.object({
  trend: z.array(z.string()).default([]),
  art: z.array(z.string()).default([]),
  politics: z.array(z.string()).default([]),
  finance: z.array(z.string()).default([])
});

const EnvSchema = z.object({
  OPENAI_MODEL: z.string().min(1).default("gpt-4.1-mini"),
  OPENAI_API_MODE: z.string().min(1).default("auto"),
  TREND_POST_COVER_IMAGE: z.string().min(1).default("/og-image.jpg"),
  TREND_POST_AUTHOR_NAME: z.string().min(1).default("NeoWhisper"),
  OPENAI_BASE_URL: z.string().url().default("https://api.openai.com/v1"),
  OPENAI_API_KEY: z.string().min(1).default("sk-local"),
  TOPIC_HINT: z.string().optional().default("")
});

const normalizeKeywordList = (list: string[]) =>
  (Array.isArray(list) ? list : []).map((item) => item.trim?.() ?? item);

const loadEnvConfig = () => {
  const env = EnvSchema.parse(process.env);
  const apiBaseUrl = env.OPENAI_BASE_URL.replace(/\/+$/, "").replace(/\/v1$/, "") + "/v1";

  return {
    model: env.OPENAI_MODEL,
    apiMode: env.OPENAI_API_MODE.toLowerCase(),
    coverImage: env.TREND_POST_COVER_IMAGE,
    authorName: env.TREND_POST_AUTHOR_NAME,
    topicHint: env.TOPIC_HINT.trim(),
    apiBaseUrl,
    apiKey: env.OPENAI_API_KEY
  };
};

const loadStaticConfig = () => {
  const feeds = z.array(FeedItemSchema).parse(feedConfig);
  const categories = z.array(CategorySchema).parse(categoryConfig);
  const keywordsRaw = KeywordsSchema.parse(keywordConfig);

  const categoryDefinitions = categories.map((category) => ({
    ...category,
    keywords: normalizeKeywordList(category.keywords)
  }));
  const keywords = Object.freeze({
    trend: normalizeKeywordList(keywordsRaw.trend),
    art: normalizeKeywordList(keywordsRaw.art),
    politics: normalizeKeywordList(keywordsRaw.politics),
    finance: normalizeKeywordList(keywordsRaw.finance)
  });

  return {
    feeds,
    categoryDefinitions,
    keywords
  };
};

const envConfig = loadEnvConfig();
const staticConfig = loadStaticConfig();

type RuntimeConfig = {
  postsDir: string;
  model: string;
  apiMode: string;
  coverImage: string;
  authorName: string;
  topicHint: string;
  apiBaseUrl: string;
  apiKey: string;
  feeds: FeedConfig[];
  categoryDefinitions: CategoryConfig[];
  keywords: KeywordBuckets;
};

export const runtimeConfig = Object.freeze({
  postsDir: POSTS_DIR,
  model: envConfig.model,
  apiMode: envConfig.apiMode,
  coverImage: envConfig.coverImage,
  authorName: envConfig.authorName,
  topicHint: envConfig.topicHint,
  apiBaseUrl: envConfig.apiBaseUrl,
  apiKey: envConfig.apiKey,
  feeds: staticConfig.feeds,
  categoryDefinitions: staticConfig.categoryDefinitions,
  keywords: staticConfig.keywords
}) satisfies RuntimeConfig;
