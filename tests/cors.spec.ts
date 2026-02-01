import { test, expect } from '@playwright/test';

// Ensure static resources do not send Access-Control-Allow-Origin headers.
// This prevents accidental broad CORS exposure for robots/sitemap.

test('robots.txt and sitemap.xml do not include ACAO header', async ({ request }) => {
  const origin = 'https://malicious.example';

  const robots = await request.get('/robots.txt', { headers: { Origin: origin } });
  const robotsHeaders = robots.headers();
  expect(robotsHeaders['access-control-allow-origin']).toBeUndefined();

  const sitemap = await request.get('/sitemap.xml', { headers: { Origin: origin } });
  const sitemapHeaders = sitemap.headers();
  expect(sitemapHeaders['access-control-allow-origin']).toBeUndefined();
});
