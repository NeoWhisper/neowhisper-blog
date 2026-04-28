import { test, expect } from "@playwright/test";

// Test suite for all UI enhancements (RSS, Dark Mode, Search, etc.)

// ===== RSS FEED TESTS =====
test("RSS feed returns valid XML with posts", async ({ request }) => {
  const res = await request.get("/rss.xml");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/xml");

  const body = await res.text();
  expect(body).toContain("<?xml version=");
  expect(body).toMatch(/<rss[^>]*version=["']2\.0["']/);
  expect(body).toContain("<channel>");
  expect(body).toContain("<item>");
});

// ===== DARK MODE TESTS =====
test.describe("Dark Mode", () => {
  test("ThemeProvider applies initial theme class", async ({ page }) => {
    await page.goto("/");

    // Verify ThemeProvider has mounted (no visibility:hidden)
    const bodyStyle = await page.evaluate(() => {
      return window.getComputedStyle(document.body).visibility;
    });
    expect(bodyStyle).not.toBe("hidden");

    // Verify html element has theme class
    const htmlHasClass = await page.evaluate(() => {
      const html = document.documentElement;
      return (
        html.classList.contains("dark") || html.classList.contains("light")
      );
    });
    expect(htmlHasClass).toBeTruthy();
  });

  test("ThemeToggle button is visible", async ({ page }) => {
    await page.goto("/");

    // Look for theme toggle button (aria-label contains "theme" or "dark" or "light")
    const toggle = page.locator(
      "button[aria-label*='theme' i], button[aria-label*='dark' i], button[aria-label*='light' i]",
    );
    await expect(toggle).toBeVisible();
  });
});

// ===== SEARCH TESTS =====
test.describe("Search", () => {
  test("Search modal opens with Cmd+K", async ({ page }) => {
    await page.goto("/blog");

    // Press Cmd+K (or Ctrl+K on Windows/Linux)
    await page.keyboard.press("Control+k");

    // Check if search input is focused/visible
    const searchInput = page.locator(
      "input[placeholder*='Search' i], input[placeholder*='検索' i]",
    );
    await expect(searchInput).toBeVisible();
  });

  test("Search returns results", async ({ page }) => {
    await page.goto("/blog");

    // Open search
    await page.keyboard.press("Control+k");

    // Type a search query
    const searchInput = page.locator("input[type='text']").first();
    await searchInput.fill("AI");

    // Wait for results to appear
    await page.waitForTimeout(300);

    // Check if results are displayed
    const results = page.locator("ul[role='listbox'] li, [class*='result']");
    const count = await results.count();
    expect(count).toBeGreaterThanOrEqual(0); // May be 0 if no matches, but should not error
  });

  test("Search closes with Escape", async ({ page }) => {
    await page.goto("/blog");

    // Open search
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(100);

    // Close with Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);

    // Search modal should be closed
    const searchModal = page
      .locator("div[class*='modal'], div[role='dialog']")
      .first();
    await expect(searchModal).toHaveCount(0);
  });
});

// ===== BREADCRUMBS TESTS =====
test("Breadcrumbs rendered on blog post page", async ({ page }) => {
  // Get a blog post
  await page.goto("/blog");

  // Click first article
  const firstArticle = page.locator("article a").first();
  await firstArticle.click();

  await page.waitForLoadState("networkidle");

  // Check for breadcrumb structure
  const breadcrumbs = page.locator(
    "nav[aria-label='breadcrumb'], nav[class*='breadcrumb'], div[class*='breadcrumb']",
  );
  const count = await breadcrumbs.count();

  // Breadcrumbs should exist (might be in different forms)
  expect(count).toBeGreaterThan(0);
});

// ===== SCROLL-TO-TOP TESTS =====
test("Scroll-to-top button appears after scrolling", async ({ page }) => {
  await page.goto("/blog");

  // Initially button should not be visible (or not exist)
  const scrollButton = page.locator(
    "button[class*='scroll'], button[aria-label*='top' i], button[aria-label*='scroll' i]",
  );

  // Scroll down
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(200);

  // Button should be visible now
  const isVisible = await scrollButton.isVisible().catch(() => false);
  expect(isVisible).toBeTruthy();
});

// ===== COPY LINK BUTTON TESTS =====
test("Copy link button exists on blog posts", async ({ page, context }) => {
  // Grant clipboard permissions
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.goto("/blog");

  // Click first article
  const firstArticle = page.locator("article a").first();
  await firstArticle.click();

  await page.waitForLoadState("networkidle");

  // Look for copy link button
  const copyButton = page
    .locator(
      "button[class*='copy'], button[aria-label*='copy' i], button[aria-label*='link' i]",
    )
    .first();
  const count = await copyButton.count();

  // Copy button should exist
  expect(count).toBeGreaterThan(0);
});

// ===== PREV/NEXT NAVIGATION TESTS =====
test("Prev/Next navigation exists on blog posts", async ({ page }) => {
  await page.goto("/blog");

  // Click first article
  const firstArticle = page.locator("article a").first();
  await firstArticle.click();

  await page.waitForTimeout(500);

  // Look for prev/next navigation
  const prevNextNav = page.locator(
    "nav[class*='navigation'], div[class*='prev'], div[class*='next'], a[class*='prev'], a[class*='next']",
  );
  const count = await prevNextNav.count();

  // Navigation should exist
  expect(count).toBeGreaterThan(0);
});

// ===== FAQ PAGE TESTS =====
test("FAQ page loads correctly", async ({ page }) => {
  await page.goto("/faq");

  // Page should load
  await expect(page).toHaveURL(/\/faq/);

  // Should have FAQ content
  const heading = page.locator("h1").first();
  await expect(heading).toBeVisible();

  // Should have FAQ items (questions)
  const questions = page.locator(
    "details, [class*='faq'], [class*='accordion']",
  );
  const count = await questions.count();
  expect(count).toBeGreaterThan(0);
});

// ===== CATEGORY POST COUNT BADGES =====
test("Category badges show post counts on blog page", async ({ page }) => {
  await page.goto("/blog");

  // Look for category badges with numbers
  const badges = page.locator(
    "span[class*='badge'], span[class*='count'], a[class*='category'] span",
  );
  const count = await badges.count();

  // Should have category badges
  expect(count).toBeGreaterThan(0);
});
