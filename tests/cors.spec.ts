import { test, expect } from "@playwright/test";

// Ensure metadata resources never return wildcard ACAO and are restricted
// to trusted origins only.
test("robots.txt and sitemap.xml use restricted ACAO policy", async ({
  request,
}) => {
  const trustedOrigin = "https://www.neowhisper.net";
  const untrustedOrigin = "https://malicious.example";

  const robotsTrusted = await request.get("/robots.txt", {
    headers: { Origin: trustedOrigin },
  });
  expect(robotsTrusted.headers()["access-control-allow-origin"]).toBe(
    trustedOrigin,
  );

  const robotsUntrusted = await request.get("/robots.txt", {
    headers: { Origin: untrustedOrigin },
  });
  const robotsUntrustedAcao =
    robotsUntrusted.headers()["access-control-allow-origin"];
  expect(robotsUntrustedAcao).toBe("https://www.neowhisper.net");
  expect(robotsUntrustedAcao).not.toBe("*");

  const sitemapTrusted = await request.get("/sitemap.xml", {
    headers: { Origin: trustedOrigin },
  });
  expect(sitemapTrusted.headers()["access-control-allow-origin"]).toBe(
    trustedOrigin,
  );

  const sitemapUntrusted = await request.get("/sitemap.xml", {
    headers: { Origin: untrustedOrigin },
  });
  const sitemapUntrustedAcao =
    sitemapUntrusted.headers()["access-control-allow-origin"];
  expect(sitemapUntrustedAcao).toBe("https://www.neowhisper.net");
  expect(sitemapUntrustedAcao).not.toBe("*");
});
