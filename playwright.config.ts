import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  globalSetup: require.resolve('./global-setup'),

  timeout: 30000,
  retries: 1,

  use: {
    baseURL: 'https://hris.itmanage.com.au',
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  },

  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-report.json' }]
  ],

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});