import { test, expect } from '@playwright/test';

test('encoded slug redirects to canonical and shows articles', async ({ page }) => {
  // Visit encoded variant which previously behaved inconsistently
  await page.goto('/category/art-%26-design');

  // After redirect / navigation, we should land on the canonical URL
  // We allow for optional query parameters (like ?lang=en)
  await expect(page).toHaveURL(/\/category\/art-design(\?.*)?$/);

  // Page should show the canonical title and the expected article count
  await expect(page.locator('h1')).toHaveText('Art & Design');
  await expect(page.locator('p', { hasText: 'article' })).toContainText('1 article');
});

test('canonical category page shows expected articles', async ({ page }) => {
  await page.goto('/category/art-design');
  await expect(page.locator('h1')).toHaveText('Art & Design');
  await expect(page.locator('p', { hasText: 'article' })).toContainText('1 article');
});

test('Next.js category shows 3 articles', async ({ page }) => {
  await page.goto('/category/next.js');
  // Title comes from the first post's category field which is "Next.js"
  await expect(page.locator('h1')).toHaveText('Next.js');
  await expect(page.locator('p', { hasText: 'article' })).toContainText('3 articles');
});
