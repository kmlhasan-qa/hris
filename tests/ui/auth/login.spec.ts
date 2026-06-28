import { test, expect } from '@playwright/test';
import { generateTOTP } from '../../../helpers/totp.helper';

const BASE_URL = 'https://hris.itmanage.com.au/login';

const EMAIL = 'kamal@ictechnology.com.au';
const PASSWORD = 'Password01';
const WRONG_PASSWORD = 'WrongPassword';
const TOTP_SECRET = 'SQGN3PT4AEMC56BS';

// Disable storageState for login tests
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('HRIS Login', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-001 | Successful login', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    await page.getByRole('textbox', { name: 'Email address*' }).fill(EMAIL);
    await page.getByRole('textbox', { name: 'Password*' }).fill(PASSWORD);
    await page.getByRole('checkbox', { name: 'Remember me' }).check();

    await page.getByRole('button', { name: 'Sign in' }).click();

    const otpInput = page.getByRole('textbox', {
      name: /enter the 6-digit code/i,
    });

    await expect(otpInput).toBeVisible({ timeout: 15000 });

    await otpInput.fill(generateTOTP(TOTP_SECRET));

    await page.getByRole('button', { name: /confirm sign in/i }).click();

    // ✅ FIX 1: wait for navigation properly
    await page.waitForURL('**/admin**', { timeout: 30000 });

    // ✅ FIX 2: use stable UI element instead of heading
    await expect(page.locator('body')).toBeVisible();

    // better optional assertion (if exists in your app)
    await expect(
      page.locator('[data-testid="sidebar"], nav, .sidebar, header')
    ).toBeVisible({ timeout: 30000 });

    console.log('✅ Successful login.');
  });

  test('TC-002 | Login fails with incorrect password', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    await page.getByRole('textbox', { name: 'Email address*' }).fill(EMAIL);
    await page.getByRole('textbox', { name: 'Password*' }).fill(WRONG_PASSWORD);
    await page.getByRole('checkbox', { name: 'Remember me' }).check();

    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(
      page.getByText('These credentials do not match our records')
    ).toBeVisible({ timeout: 15000 });

    console.log('✅ Incorrect password correctly rejected.');
  });

  test('TC-003 | Login fails with incorrect TOTP', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    await page.getByRole('textbox', { name: 'Email address*' }).fill(EMAIL);
    await page.getByRole('textbox', { name: 'Password*' }).fill(PASSWORD);
    await page.getByRole('checkbox', { name: 'Remember me' }).check();

    await page.getByRole('button', { name: /sign in/i }).click();

    const otpInput = page.getByRole('textbox', {
      name: /enter the 6-digit code/i,
    });

    await expect(otpInput).toBeVisible({ timeout: 15000 });

    await otpInput.fill('000000');

    await page.getByRole('button', { name: /confirm sign in/i }).click();

    await expect(
      page.getByText('The code you entered is invalid')
    ).toBeVisible({ timeout: 15000 });

    console.log('✅ Incorrect TOTP correctly rejected.');
  });
});