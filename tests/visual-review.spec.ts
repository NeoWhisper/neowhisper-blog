import { test } from "@playwright/test";
import path from "path";

const screenshotDir = path.join(__dirname, "../.playwright-screenshots");

test.describe("Visual Design Review - Articles", () => {
  test.setTimeout(120000); // 2 minutes for slow CI compilation
  
  test("Blog listing - article cards layout", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/blog");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(800); // let animations settle

    await page.screenshot({
      path: `${screenshotDir}/01-blog-listing-full.png`,
      fullPage: true,
    });

    // Also capture just the hero area / above the fold
    await page.screenshot({
      path: `${screenshotDir}/02-blog-listing-atf.png`,
      fullPage: false,
    });
  });

  test("Blog post - hero area and body", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/blog/local-llm-tools-lm-studio-ollama-mlx");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Hero (above the fold)
    await page.screenshot({
      path: `${screenshotDir}/03-post-hero.png`,
      fullPage: false,
    });

    // Scroll to article body
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${screenshotDir}/04-post-body-toc.png`,
      fullPage: false,
    });

    // Scroll to bottom (prev/next + footer)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${screenshotDir}/05-post-bottom-footer.png`,
      fullPage: false,
    });
  });

  test("Blog post - Arabic RTL layout", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/blog/local-llm-tools-lm-studio-ollama-mlx-ar");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: `${screenshotDir}/06-post-arabic-hero.png`,
      fullPage: false,
    });

    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${screenshotDir}/07-post-arabic-body.png`,
      fullPage: false,
    });
  });

  test("Blog post - Japanese layout", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/blog/local-llm-tools-lm-studio-ollama-mlx-ja");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: `${screenshotDir}/08-post-japanese-hero.png`,
      fullPage: false,
    });

    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${screenshotDir}/09-post-japanese-body.png`,
      fullPage: false,
    });
  });

  test("Mobile view - article card layout", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
    await page.goto("/blog");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(800);

    await page.screenshot({
      path: `${screenshotDir}/10-mobile-blog-listing.png`,
      fullPage: false,
    });
  });

  test("Mobile view - blog post", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/blog/local-llm-tools-lm-studio-ollama-mlx");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(800);

    await page.screenshot({
      path: `${screenshotDir}/11-mobile-post-hero.png`,
      fullPage: false,
    });
  });
});
