import { test, expect } from "@playwright/test";

// Ensure metadata resources never return wildcard ACAO and are restricted
// to trusted origins only.
test("robots.txt and sitemap.xml use restricted ACAO policy", async ({
  request,
}) => {
  const trustedOrigin = "https://www.neowhisper.net";
  const untrustedOrigin = "https://malicious.example";

  // Note: In dev environment (localhost), SITE_ORIGINS doesn't include localhost
  // so the CORS header will be empty string "" for non-trusted origins
  // In production, trusted origins get their origin reflected back

  const robotsTrusted = await request.get("/robots.txt", {
    headers: { Origin: trustedOrigin },
  });
  const robotsAcao = robotsTrusted.headers()["access-control-allow-origin"];
  // In production: should be trustedOrigin; in dev: might be "" or undefined since localhost is not in SITE_ORIGINS
  expect(
    robotsAcao === trustedOrigin ||
      robotsAcao === "" ||
      robotsAcao === undefined,
  ).toBe(true);
  expect(robotsAcao).not.toBe("*");

  const robotsUntrusted = await request.get("/robots.txt", {
    headers: { Origin: untrustedOrigin },
  });
  const robotsUntrustedAcao =
    robotsUntrusted.headers()["access-control-allow-origin"];
  expect(robotsUntrustedAcao === undefined || robotsUntrustedAcao === "").toBe(
    true,
  );
  expect(robotsUntrustedAcao).not.toBe("*");

  const sitemapTrusted = await request.get("/sitemap.xml", {
    headers: { Origin: trustedOrigin },
  });
  const sitemapAcao = sitemapTrusted.headers()["access-control-allow-origin"];
  // In production: should be trustedOrigin; in dev: might be "" or undefined
  expect(
    sitemapAcao === trustedOrigin ||
      sitemapAcao === "" ||
      sitemapAcao === undefined,
  ).toBe(true);
  expect(sitemapAcao).not.toBe("*");

  const sitemapUntrusted = await request.get("/sitemap.xml", {
    headers: { Origin: untrustedOrigin },
  });
  const sitemapUntrustedAcao =
    sitemapUntrusted.headers()["access-control-allow-origin"];
  expect(
    sitemapUntrustedAcao === undefined || sitemapUntrustedAcao === "",
  ).toBe(true);
  expect(sitemapUntrustedAcao).not.toBe("*");
});
