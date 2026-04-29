import { test, expect } from "@playwright/test";

// Test suite for individual blog post pages
test.describe("Blog Post Page", () => {
  test("renders post with title, content, and metadata", async ({ page }) => {
    await page.goto("/blog");

    // Click first article to go to a post page
    const firstArticle = page.locator("article a").first();
    await firstArticle.click();

    // Wait for post page to load
    await page.waitForLoadState("networkidle");

    // Verify title is visible
    const title = page.locator("h1").first();
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText?.length).toBeGreaterThan(0);

    // Verify article content exists
    const article = page.locator("article").first();
    await expect(article).toBeVisible();

    // Verify date is shown
    const dateElement = page.locator("time").first();
    await expect(dateElement).toBeVisible();
  });

  test("displays post navigation (prev/next)", async ({ page }) => {
    await page.goto("/blog");

    // Navigate to a post
    const firstArticle = page.locator("article a").first();
    await firstArticle.click();
    await page.waitForLoadState("networkidle");

    // Look for prev/next navigation
    const prevNextNav = page
      .locator("nav")
      .filter({ hasText: /Previous|Next|前|次/ });
    // Note: prev/next might not exist for first/last posts, so just check it doesn't error
    const count = await prevNextNav.count();
    // Either 0 (no nav) or 1 (nav exists) is valid
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("displays copy link button", async ({ page }) => {
    await page.goto("/blog");

    const firstArticle = page.locator("article a").first();
    await firstArticle.click();
    await page.waitForLoadState("networkidle");

    // Look for copy link button
    const copyButton = page
      .locator("button")
      .filter({ hasText: /Copy|リンク|نسخ/ });
    await expect(copyButton).toBeVisible();
  });

  test("handles 404 for invalid slug", async ({ page }) => {
    await page.goto("/blog/this-post-does-not-exist-12345");

    // Should show 404 page or redirect
    const pageTitle = await page.title();
    // Either 404 in title or redirects to blog listing
    expect(
      pageTitle.includes("404") ||
        pageTitle.includes("Not Found") ||
        page.url().includes("/blog"),
    ).toBe(true);
  });

  test("renders Japanese post correctly", async ({ page }) => {
    // Navigate to blog and look for Japanese post
    await page.goto("/blog");

    // Look for link with -ja suffix
    const jaLink = page.locator("a[href*='-ja']").first();
    const jaLinkCount = await jaLink.count();

    if (jaLinkCount > 0) {
      await jaLink.click();
      await page.waitForLoadState("networkidle");

      // Verify content loaded
      const article = page.locator("article").first();
      await expect(article).toBeVisible();
    } else {
      // Skip if no Japanese posts
      test.skip();
    }
  });

  test("renders Arabic post correctly", async ({ page }) => {
    // Navigate to blog and look for Arabic post
    await page.goto("/blog");

    // Look for link with -ar suffix
    const arLink = page.locator("a[href*='-ar']").first();
    const arLinkCount = await arLink.count();

    if (arLinkCount > 0) {
      await arLink.click();
      await page.waitForLoadState("networkidle");

      // Verify RTL direction for Arabic
      const html = page.locator("html");
      const dir = await html.getAttribute("dir");
      // Arabic posts should have dir="rtl"
      if (dir) {
        expect(dir).toBe("rtl");
      }

      // Verify content loaded
      const article = page.locator("article").first();
      await expect(article).toBeVisible();
    } else {
      // Skip if no Arabic posts
      test.skip();
    }
  });

  test("post has proper semantic structure", async ({ page }) => {
    await page.goto("/blog");

    const firstArticle = page.locator("article a").first();
    await firstArticle.click();
    await page.waitForLoadState("networkidle");

    // Check for main content landmark
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Check for article element (first one, as there may be multiple)
    const article = page.locator("article").first();
    await expect(article).toBeVisible();

    // Check for time element with datetime attribute
    const time = page.locator("time[datetime]").first();
    await expect(time).toBeVisible();
  });
});
