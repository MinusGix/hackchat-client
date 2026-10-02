/**
 * Browser-level tests. These cover behaviour jsdom can't model: layout,
 * scrolling, image loading and real event propagation.
 *
 * The hack.chat websocket is faked per test (see e2e/fixtures.js), so no
 * server is needed. The dev server is started automatically.
 *
 * Set CHROME_PATH to use a system Chrome instead of a Playwright-managed
 * browser (e.g. on NixOS, where downloaded browsers don't run).
 *
 * Set E2E_BASE_URL to test an already-running server instead, e.g. a
 * production build: the dev build is much slower, which matters for
 * performance tests.
 */

import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.E2E_PORT || 3100;
const BASE_URL = process.env.E2E_BASE_URL;

const devServer = {
  command: `npx cross-env NODE_ENV=development node server --port=${PORT}`,
  url: `http://localhost:${PORT}`,
  reuseExistingServer: !process.env.CI,
  timeout: 180000,
};

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL || `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: process.env.CHROME_PATH
          ? { executablePath: process.env.CHROME_PATH }
          : {},
      },
    },
  ],
  webServer: BASE_URL ? undefined : devServer,
});
