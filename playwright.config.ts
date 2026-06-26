import { defineConfig, devices } from '@playwright/test';
import { HRIS_BASE_URL } from './helpers/config';

export default defineConfig({
  testDir: './tests',

  globalSetup: require.resolve('./global-setup'),

  timeout: 30000,
  retries: 1,

  use: {
    baseURL: HRIS_BASE_URL,
    headless: true,
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
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});