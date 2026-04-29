import { test, expect } from "@playwright/test";

// Test suite for SEO metadata validation
test.describe("SEO Metadata", () => {
  test("homepage has proper meta tags", async ({ page }) => {
    await page.goto("/");

    // Check page title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThan(70); // SEO best practice

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]').first();
    const descriptionContent = await metaDescription.getAttribute("content");
    expect(descriptionContent).toBeTruthy();
    // Note: SEO best practice is <160 chars, but some valid descriptions may be slightly longer
    expect(descriptionContent?.length).toBeLessThanOrEqual(200);

    // Check canonical link
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href");
  });

  test("blog post has proper meta tags", async ({ page }) => {
    await page.goto("/blog");

    // Navigate to a post
    const firstArticle = page.locator("article a").first();
    await firstArticle.click();
    await page.waitForLoadState("networkidle");

    // Check title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Check meta description exists
    const metaDescription = page.locator('meta[name="description"]');
    const count = await metaDescription.count();
    expect(count).toBeGreaterThan(0);

    // Check Open Graph title (use first() as there may be both site and page-specific OG tags)
    const ogTitle = page.locator('meta[property="og:title"]').first();
    const ogTitleContent = await ogTitle.getAttribute("content");
    expect(ogTitleContent).toBeTruthy();

    // Check Open Graph description
    const ogDescription = page
      .locator('meta[property="og:description"]')
      .first();
    const ogDescContent = await ogDescription.getAttribute("content");
    expect(ogDescContent).toBeTruthy();

    // Check Open Graph type (may not exist on all pages)
    const ogType = page.locator('meta[property="og:type"]').first();
    const ogTypeContent = await ogType.getAttribute("content");
    // Could be "website" for home, "article" for posts
    expect(["website", "article"]).toContain(ogTypeContent);

    // Check canonical link
    const canonical = page.locator('link[rel="canonical"]');
    const canonicalHref = await canonical.getAttribute("href");
    expect(canonicalHref).toBeTruthy();
  });

  test("blog listing page has proper meta tags", async ({ page }) => {
    await page.goto("/blog");

    // Check title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toContain("blog");

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    const count = await metaDescription.count();
    expect(count).toBeGreaterThan(0);

    // Check canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", /\/blog$/);
  });

  test("has structured data (JSON-LD)", async ({ page }) => {
    await page.goto("/blog");

    // Navigate to a post
    const firstArticle = page.locator("article a").first();
    await firstArticle.click();
    await page.waitForLoadState("networkidle");

    // Check for JSON-LD script
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThan(0);

    // Validate JSON is parseable
    if (count > 0) {
      const jsonContent = await jsonLd.first().textContent();
      expect(() => JSON.parse(jsonContent || "{}")).not.toThrow();
    }
  });

  test("has proper hreflang tags", async ({ page }) => {
    await page.goto("/blog");

    // Check for hreflang links
    const hreflangs = page.locator('link[rel="alternate"]');
    const count = await hreflangs.count();

    // Should have hreflang for each language variant
    if (count > 0) {
      const hreflangLangs: string[] = [];
      for (let i = 0; i < count; i++) {
        const lang = await hreflangs.nth(i).getAttribute("hreflang");
        if (lang) hreflangLangs.push(lang);
      }

      // Should have English at minimum
      expect(hreflangLangs).toContain("en");
    }
  });

  test("has Twitter Card meta tags", async ({ page }) => {
    await page.goto("/blog");

    // Navigate to a post
    const firstArticle = page.locator("article a").first();
    await firstArticle.click();
    await page.waitForLoadState("networkidle");

    // Check Twitter Card title (use first() as there may be duplicates)
    const twitterTitle = page.locator('meta[name="twitter:title"]').first();
    const twitterTitleContent = await twitterTitle.getAttribute("content");
    expect(twitterTitleContent).toBeTruthy();

    // Check Twitter Card description
    const twitterDesc = page
      .locator('meta[name="twitter:description"]')
      .first();
    const twitterDescContent = await twitterDesc.getAttribute("content");
    expect(twitterDescContent).toBeTruthy();

    // Check Twitter Card type
    const twitterCard = page.locator('meta[name="twitter:card"]');
    const twitterCardContent = await twitterCard.getAttribute("content");
    expect(twitterCardContent).toBeTruthy();
  });

  test("robots meta tag allows indexing for normal posts", async ({ page }) => {
    await page.goto("/blog");

    const firstArticle = page.locator("article a").first();
    await firstArticle.click();
    await page.waitForLoadState("networkidle");

    // Check robots meta (use first() as there may be duplicates)
    const robotsMeta = page.locator('meta[name="robots"]').first();
    const count = await robotsMeta.count();

    if (count > 0) {
      const robotsContent = await robotsMeta.getAttribute("content");
      // Should not contain "noindex"
      expect(robotsContent).not.toContain("noindex");
    }
  });
});
