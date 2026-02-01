import { test, expect } from '@playwright/test';

// This test runs headless (no browser extensions) and ensures there are no
// React hydration warnings or extension-injected DOM attributes (e.g.
// data-darkreader-*) on a canonical category page.

test('no hydration warnings and no extension-injected attributes', async ({ page, request }) => {
  const logs: string[] = [];
  page.on('console', (msg) => logs.push(`${msg.type()}: ${msg.text()}`));

  // Fetch server-rendered HTML without executing scripts for comparison.
  const res = await request.get('/category/art-design');
  const serverHtml = await res.text();

  await page.goto('/category/art-design', { waitUntil: 'load' });
  await expect(page.locator('h1')).toHaveText('Art & Design');

  // Check console logs for hydration warnings
  const concat = logs.join('\n');
  expect(concat).not.toMatch(/hydration|hydrated|A tree hydrated/i);

  // Check that no attributes starting with 'data-darkreader' exist on the HTML element
  const hasDarkReaderAttr = await page.evaluate(() => {
    const attrs = Array.from(document.documentElement.attributes).map(a => a.name);
    return attrs.some(n => n.toLowerCase().startsWith('data-darkreader'));
  });
  expect(hasDarkReaderAttr).toBe(false);

  // Ensure server HTML also doesn't include darkreader attributes
  expect(serverHtml).not.toMatch(/data-darkreader/i);
});
