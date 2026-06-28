import { defineConfig, devices } from '@playwright/test';
import { HRIS_BASE_URL } from './helpers/config';

export default defineConfig({
  testDir: './tests',

  globalSetup: require.resolve('./global-setup'),

  // Global timeout per test
  timeout: 180_000,

  // Retry once in CI
  retries: 1,

  // IMPORTANT: force serial execution to avoid OTP conflicts
  workers: 1,

  use: {
    baseURL: HRIS_BASE_URL,
    headless: true,
    viewport: { width: 1440, height: 900 },

    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-report.json' }],
  ],

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});