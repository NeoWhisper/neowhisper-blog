import { test, expect } from '@playwright/test';

// Verify site sends security headers to prevent MIME sniffing.

test('X-Content-Type-Options header is present and set to nosniff', async ({ request }) => {
  const paths = ['/', '/robots.txt', '/sitemap.xml', '/category/art-design'];

  for (const p of paths) {
    const res = await request.get(p, { headers: { Origin: 'https://example.com' } });
    const headers = res.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
  }
});
