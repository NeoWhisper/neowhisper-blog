import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    // If a dev server is already running (e.g. you started `npm run dev`
    // yourself), allow Playwright to reuse it instead of trying to start a
    // new one. This avoids "lock" errors from Next's dev server during
    // local development.
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
