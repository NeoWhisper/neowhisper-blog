const DEFAULT_SITE_URL = "https://www.neowhisper.net";
const DEFAULT_CANONICAL_REDIRECT_SKIP_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "10.",
  "172.16.",
  "172.17.",
  "172.18.",
  "172.19.",
  "172.20.",
  "172.21.",
  "172.22.",
  "172.23.",
  "172.24.",
  "172.25.",
  "172.26.",
  "172.27.",
  "172.28.",
  "172.29.",
  "172.30.",
  "172.31.",
  "192.168.",
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
