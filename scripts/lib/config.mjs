import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

export const CONFIG_DIR = path.join(process.cwd(), "scripts/config");
export const POSTS_DIR = path.join(process.cwd(), "src/content/posts");
export const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
export const API_MODE = (process.env.OPENAI_API_MODE || "auto").toLowerCase();
export const COVER_IMAGE = process.env.TREND_POST_COVER_IMAGE || "/og-image.jpg";
export const AUTHOR_NAME = process.env.TREND_POST_AUTHOR_NAME || "NeoWhisper";
export const TOPIC_HINT = (process.env.TOPIC_HINT || "").trim();
export const API_BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "").replace(/\/v1$/, "") + "/v1";
export const API_KEY = process.env.OPENAI_API_KEY || "sk-local";
export const FORCE = process.argv.includes("--force");
export const DRY_RUN = process.argv.includes("--dry-run");

export const ConfigState = {
  FEEDS: [],
  CATEGORY_DEFINITIONS: [],
  KEYWORDS: { trend: [], art: [], politics: [], finance: [] },
  CATEGORY_MAP: new Map()
};

export async function loadConfig(filename, defaultValue = []) {
  try {
    const filePath = path.join(CONFIG_DIR, filename);
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.warn(`[daily-trends] Warning: Could not load config ${filename}, using default.`);
    return defaultValue;
  }
}

export async function initializeConfigs() {
  ConfigState.FEEDS = await loadConfig("feeds.json");
  ConfigState.CATEGORY_DEFINITIONS = await loadConfig("categories.json");
  ConfigState.KEYWORDS = await loadConfig("keywords.json", { trend: [], art: [], politics: [], finance: [] });
  ConfigState.CATEGORY_MAP = new Map(ConfigState.CATEGORY_DEFINITIONS.map(c => [c.slug, c]));
}

export function isOfficialOpenAiBaseUrl(baseUrl) {
  try {
    const parsed = new URL(baseUrl);
    return parsed.hostname === "api.openai.com";
  } catch {
    return false;
  }
}
