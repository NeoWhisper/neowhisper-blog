import { test, expect, type Page } from '@playwright/test';

async function expectCategorySummaryToMatchCards(page: Page) {
  const summaryText = (await page.locator('header p').textContent())?.trim() ?? '';
  const match = summaryText.match(/^(\d+)\s+article/);

  expect(match, `Unexpected category summary text: "${summaryText}"`).not.toBeNull();
  const summaryCount = Number(match![1]);

  await expect(page.locator('article')).toHaveCount(summaryCount);
  expect(summaryCount).toBeGreaterThan(0);
}

test('encoded slug redirects to canonical and shows articles', async ({ page }) => {
  // Visit encoded variant which previously behaved inconsistently
  await page.goto('/category/art-%26-design');

  // After redirect / navigation, we should land on the canonical URL
  // We allow for optional query parameters (like ?lang=en)
  await expect(page).toHaveURL(/\/category\/art-design(\?.*)?$/);

  // Page should show the canonical title and the expected article count
  await expect(page.locator('h1')).toHaveText('Art & Design');
  await expectCategorySummaryToMatchCards(page);
});

test('canonical category page shows expected articles', async ({ page }) => {
  await page.goto('/category/art-design');
  await expect(page.locator('h1')).toHaveText('Art & Design');
  await expectCategorySummaryToMatchCards(page);
});

test('Next.js category shows articles with matching summary count', async ({ page }) => {
  await page.goto('/category/next.js');
  // Title comes from the first post's category field which is "Next.js"
  await expect(page.locator('h1')).toHaveText('Next.js');
  await expectCategorySummaryToMatchCards(page);
});
