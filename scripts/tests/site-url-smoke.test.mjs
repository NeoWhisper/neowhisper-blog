import assert from "node:assert/strict";
import test from "node:test";

const loadModule = async (path) => import(path);
const pickExport = (mod, key) => mod[key] ?? mod.default?.[key];
const pickDefaultFn = (mod) => mod.default ?? mod;

test("site config exposes canonical url and origins", () => {
  return loadModule("../../src/lib/site-config.ts").then((mod) => {
    const SITE_URL = pickExport(mod, "SITE_URL");
    const SITE_ORIGINS = pickExport(mod, "SITE_ORIGINS");

    assert.equal(typeof SITE_URL, "string");
    assert.ok(SITE_URL.startsWith("http"));
    assert.ok(Array.isArray(SITE_ORIGINS));
    assert.ok(SITE_ORIGINS.includes(SITE_URL));
    assert.ok(SITE_ORIGINS.every((origin) => origin.startsWith("http")));
  });
});

test("robots uses SITE_URL-based sitemap entries", async () => {
  const [robotsMod, siteConfigMod] = await Promise.all([
    loadModule("../../src/app/robots.ts"),
    loadModule("../../src/lib/site-config.ts"),
  ]);
  const robots = pickDefaultFn(robotsMod);
  const SITE_URL = pickExport(siteConfigMod, "SITE_URL");

  const data = robots();
  const sitemapUrls = Array.isArray(data.sitemap) ? data.sitemap : [];

  assert.ok(sitemapUrls.includes(`${SITE_URL}/sitemap.xml`));
  assert.ok(sitemapUrls.includes(`${SITE_URL}/image-sitemap.xml`));
});

test("sitemap root entries are anchored to SITE_URL", async () => {
  const [sitemapMod, siteConfigMod] = await Promise.all([
    loadModule("../../src/app/sitemap.ts"),
    loadModule("../../src/lib/site-config.ts"),
  ]);
  const sitemap = pickDefaultFn(sitemapMod);
  const SITE_URL = pickExport(siteConfigMod, "SITE_URL");

  const entries = await sitemap();
  const urls = entries.map((entry) => entry.url);

  assert.ok(urls.includes(SITE_URL));
  assert.ok(urls.includes(`${SITE_URL}/blog`));
  assert.ok(urls.every((url) => url.startsWith(SITE_URL)));
});
