import { test, expect } from "@playwright/test";

// Ensure static resources do not send Access-Control-Allow-Origin headers.
// This prevents accidental broad CORS exposure for robots/sitemap.
// Note: Next.js doesn't allow complete header removal, so we accept empty string as valid.

test("robots.txt and sitemap.xml do not include ACAO header", async ({
  request,
}) => {
  const origin = "https://malicious.example";

  const robots = await request.get("/robots.txt", {
    headers: { Origin: origin },
  });
  const robotsHeaders = robots.headers();
  // Accept undefined or empty string (Next.js limitation - can't remove, only override)
  const robotsAcao = robotsHeaders["access-control-allow-origin"];
  expect(robotsAcao === undefined || robotsAcao === "").toBe(true);

  const sitemap = await request.get("/sitemap.xml", {
    headers: { Origin: origin },
  });
  const sitemapHeaders = sitemap.headers();
  // Accept undefined or empty string (Next.js limitation - can't remove, only override)
  const sitemapAcao = sitemapHeaders["access-control-allow-origin"];
  expect(sitemapAcao === undefined || sitemapAcao === "").toBe(true);
});
