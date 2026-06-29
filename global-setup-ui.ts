import fs from 'fs';
import { chromium } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { generateTOTP } from './helpers/totp.helper';

const EMAIL = 'kamal@ictechnology.com.au';
const PASSWORD = 'Password01';
const TOTP_SECRET = 'SQGN3PT4AEMC56BS';

export default async function SetupUI() {
  console.log('🚀 Starting global setup...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const loginPage = new LoginPage(page);

  await loginPage.goto('https://hris.itmanage.com.au/login');

  await loginPage.emailInput().fill(EMAIL);
  await loginPage.passwordInput().fill(PASSWORD);
  await loginPage.rememberMe().check();
  await loginPage.signInButton().click();

  await loginPage.otpInput().waitFor({ timeout: 15000 });

  const otp = generateTOTP(TOTP_SECRET);
  await loginPage.otpInput().fill(otp);
  await loginPage.confirmButton().click();

  await loginPage.dashboardTitle().waitFor({ timeout: 30000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  console.log('Final URL:', page.url());

  const cookies = await page.context().cookies();
  console.log('Cookies:', cookies.map(c => ({
    name: c.name,
    domain: c.domain,
  })));

  fs.mkdirSync('playwright/.auth', { recursive: true });

  await page.context().storageState({
    path: 'playwright/.auth/user.json',
  });

  console.log('✅ Storage state saved.');

  await browser.close();
}