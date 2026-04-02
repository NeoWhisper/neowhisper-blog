const DEFAULT_SITE_URL = "https://www.neowhisper.net";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL)
  .replace(/\/+$/, "");

export const SITE_ORIGINS = Object.freeze([
  SITE_URL,
  SITE_URL.replace("://www.", "://")
]);
