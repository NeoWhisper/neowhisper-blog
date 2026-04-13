import process from "node:process";
import { runtimeConfig } from "./runtime-config";

export const POSTS_DIR = runtimeConfig.postsDir;
export const MODEL = runtimeConfig.model;
export const API_MODE = runtimeConfig.apiMode;
export const COVER_IMAGE = runtimeConfig.coverImage;
export const AUTHOR_NAME = runtimeConfig.authorName;
export const TOPIC_HINT = runtimeConfig.topicHint;
export const API_BASE_URL = runtimeConfig.apiBaseUrl;
export const API_KEY = runtimeConfig.apiKey;
export const OLLAMA_IMAGE_MODEL = runtimeConfig.ollamaImageModel;
export const MFLUX_MODEL = runtimeConfig.mfluxModel;
export const LM_STUDIO_IMAGE_URL = runtimeConfig.lmStudioImageUrl;
export const FORCE = process.argv.includes("--force");
export const DRY_RUN = process.argv.includes("--dry-run");

type CategoryDefinition = (typeof runtimeConfig.categoryDefinitions)[number];

const createCategoryMap = (definitions: CategoryDefinition[]) =>
  new Map(definitions.map((category) => [category.slug, category]));

export const ConfigState = Object.freeze({
  FEEDS: runtimeConfig.feeds,
  CATEGORY_DEFINITIONS: runtimeConfig.categoryDefinitions,
  KEYWORDS: runtimeConfig.keywords,
  get CATEGORY_MAP() {
    return createCategoryMap(this.CATEGORY_DEFINITIONS);
  },
});

export async function initializeConfigs() {
  void ConfigState.CATEGORY_MAP;
}

export function isOfficialOpenAiBaseUrl(baseUrl: string) {
  try {
    const parsed = new URL(baseUrl);
    return parsed.hostname === "api.openai.com";
  } catch {
    return false;
  }
}
