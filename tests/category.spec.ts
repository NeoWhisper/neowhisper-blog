import { test, expect } from '@playwright/test';

test('encoded slug redirects to canonical and shows articles', async ({ page }) => {
  // Visit encoded variant which previously behaved inconsistently
  await page.goto('/category/art-%26-design');

  // After redirect / navigation, we should land on the canonical URL
  await expect(page).toHaveURL(/\/category\/art-design$/);

  // Page should show the canonical title and the expected article count
  await expect(page.locator('h1')).toHaveText('Art & Design');
  await expect(page.locator('p', { hasText: 'articles in this category' })).toContainText('3 articles');
});

test('canonical category page shows expected articles', async ({ page }) => {
  await page.goto('/category/art-design');
  await expect(page.locator('h1')).toHaveText('Art & Design');
  await expect(page.locator('p', { hasText: 'articles in this category' })).toContainText('3 articles');
});
