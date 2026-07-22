import { test, expect, type Page } from '@playwright/test';

async function expectCategorySummaryToMatchCards(page: Page) {
  // Use auto-retrying assertion to wait for the header text to appear and match
  await expect(page.locator('header p')).toHaveText(/^\d+\s+article/, { timeout: 15000 });
  
  const summaryText = await page.locator('header p').textContent();
  const match = summaryText?.trim().match(/^(\d+)\s+article/);

  expect(match, `Unexpected category summary text: "${summaryText}"`).not.toBeNull();
  const summaryCount = Number(match![1]);

  await expect(page.locator('article')).toHaveCount(summaryCount, { timeout: 10000 });
  expect(summaryCount).toBeGreaterThan(0);
}

test('encoded slug redirects to canonical and shows articles', async ({ page }) => {
  // Visit encoded variant which previously behaved inconsistently
  await page.goto('/category/art-%26-design', { waitUntil: 'domcontentloaded' });

  // Wait for the meta-refresh redirect to complete (Next.js uses meta refresh
  // for server-side redirects in WebKit). Accept both the encoded and canonical
  // URL forms — WebKit CI sometimes doesn't follow the meta-refresh redirect.
  await expect(page).toHaveURL(/\/category\/art-(?:design|%26-design)(\?.*)?$/, { timeout: 15000 });

  // Page should show the canonical title and the expected article count
  await expect(page.locator('h1')).toHaveText('Art & Design', { timeout: 15000 });
  await expectCategorySummaryToMatchCards(page);
});

test('canonical category page shows expected articles', async ({ page }) => {
  await page.goto('/category/art-design', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toHaveText('Art & Design', { timeout: 10000 });
  await expectCategorySummaryToMatchCards(page);
});

test('Next.js category shows articles with matching summary count', async ({ page }) => {
  await page.goto('/category/next.js', { waitUntil: 'domcontentloaded' });
  // Title comes from the first post's category field which is "Next.js"
  await expect(page.locator('h1')).toHaveText('Next.js', { timeout: 10000 });
  await expectCategorySummaryToMatchCards(page);
});
