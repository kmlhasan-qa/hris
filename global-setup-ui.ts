import fs from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';
import { LoginPage } from './src/pages/auth/LoginPage';
import { UI_LOGIN } from './src/config/env';

const AUTH_FILE = 'playwright/.auth/user.json';

/**
 * Authenticate once and persist the session to storageState so every UI spec
 * starts logged in. Waits on the dashboard heading (real readiness signal)
 * instead of networkidle / fixed sleeps.
 */
export default async function setupUI(): Promise<void> {
  console.log('🚀 UI global setup: authenticating...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const loginPage = new LoginPage(page);
    await page.goto(UI_LOGIN.url, { waitUntil: 'domcontentloaded' });
    await loginPage.login(UI_LOGIN.email, UI_LOGIN.password, UI_LOGIN.totpSecret);

    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
    await page.context().storageState({ path: AUTH_FILE });

    console.log(`✅ Storage state saved to ${AUTH_FILE}`);
  } finally {
    await browser.close();
  }
}
