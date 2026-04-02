const DEFAULT_SITE_URL = "https://www.neowhisper.net";
const DEFAULT_CANONICAL_REDIRECT_SKIP_HOSTS = [
  "localhost",
  "127.0.0.1",
  ".vercel.app",
];

/**
 * Site-level URL config only.
 *
 * Keep this module narrowly scoped to canonical site URL/origin resolution.
 * Do NOT add unrelated app settings, feature flags, or content constants here.
 * Create dedicated modules for those concerns to avoid a "god config" file.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL)
  .replace(/\/+$/, "");

export const SITE_ORIGINS = Object.freeze([
  SITE_URL,
  SITE_URL.replace("://www.", "://")
]);

const rawSkipHosts =
  process.env.CANONICAL_REDIRECT_SKIP_HOSTS
    ?.split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean) ?? DEFAULT_CANONICAL_REDIRECT_SKIP_HOSTS;

export const CANONICAL_REDIRECT_SKIP_HOSTS = Object.freeze(rawSkipHosts);
