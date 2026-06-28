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

  // ─────────────────────────────────────────────────────────────
  // TC-001 | Successful login
  // ─────────────────────────────────────────────────────────────
  test('TC-001 | Successful login', async ({ page }) => {
    await page.goto(BASE_URL);

    await page
      .getByRole('textbox', { name: 'Email address*' })
      .fill(EMAIL);

    await page
      .getByRole('textbox', { name: 'Password*' })
      .fill(PASSWORD);

    await page
      .getByRole('checkbox', { name: 'Remember me' })
      .check();

    await page
      .getByRole('button', { name: 'Sign in' })
      .click();

    const otpInput = page.getByRole('textbox', {
      name: 'Enter the 6-digit code from',
    });

    await expect(otpInput).toBeVisible({ timeout: 15000 });

    const otp = generateTOTP(TOTP_SECRET);
    await otpInput.fill(otp);

    await page
      .getByRole('button', { name: 'Confirm sign in' })
      .click();

    await expect(
      page.getByRole('heading', { name: 'Dashboard' })
    ).toBeVisible({ timeout: 30000 });

    console.log('✅ Successful login.');
  });

  // ─────────────────────────────────────────────────────────────
  // TC-002 | Invalid password
  // ─────────────────────────────────────────────────────────────
  test('TC-002 | Login fails with incorrect password', async ({ page }) => {
    await page.goto(BASE_URL);

    await page
      .getByRole('textbox', { name: 'Email address*' })
      .fill(EMAIL);

    await page
      .getByRole('textbox', { name: 'Password*' })
      .fill(WRONG_PASSWORD);

    await page
      .getByRole('checkbox', { name: 'Remember me' })
      .check();

    await page
      .getByRole('button', { name: 'Sign in' })
      .click();

    await expect(
      page.getByText('These credentials do not match our records')
    ).toBeVisible({ timeout: 10000 });

    console.log('✅ Incorrect password correctly rejected.');
  });

  // ─────────────────────────────────────────────────────────────
  // TC-003 | Invalid TOTP
  // ─────────────────────────────────────────────────────────────
  test('TC-003 | Login fails with incorrect TOTP', async ({ page }) => {
    await page.goto(BASE_URL);

    await page
      .getByRole('textbox', { name: 'Email address*' })
      .fill(EMAIL);

    await page
      .getByRole('textbox', { name: 'Password*' })
      .fill(PASSWORD);

    await page
      .getByRole('checkbox', { name: 'Remember me' })
      .check();

    await page
      .getByRole('button', { name: 'Sign in' })
      .click();

    const otpInput = page.getByRole('textbox', {
      name: 'Enter the 6-digit code from',
    });

    await expect(otpInput).toBeVisible({ timeout: 15000 });

    await otpInput.fill('000000');

    await page
      .getByRole('button', { name: 'Confirm sign in' })
      .click();

    await expect(
      page.getByText('The code you entered is invalid')
    ).toBeVisible({ timeout: 10000 });

    console.log('✅ Incorrect TOTP correctly rejected.');
  });
});