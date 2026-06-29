import { defineConfig, devices } from '@playwright/test';
import { HRIS_BASE_URL } from './helpers/config';

export default defineConfig({
  testDir: './tests',

  globalSetup: require.resolve('./global-setup.ts'),

  timeout: 180000,
  retries: 1,
  workers: 1,

  use: {
    baseURL: HRIS_BASE_URL,
    storageState: 'playwright/.auth/user.json',

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
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});