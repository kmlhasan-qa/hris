/*

import { Locator, test, expect } from '@playwright/test';
import { login } from '../../helpers/login.helper';

const BASE_URL = 'https://hris.itmanage.com.au/login';
const EMAIL = 'kamal@ictechnology.com.au';
const PASSWORD = 'Password01';
const TOTP_SECRET = 'SQGN3PT4AEMC56BS';

test('TC-001 | Successful login', async ({ page }) => {
  await login(page);
  console.log('✅ Successful login.');
    });


// ── TC-002: Login fails with wrong password ────────────────────────────────
test('TC-002 | Login fails with incorrect password', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('textbox', { name: 'Email address*' }).fill(EMAIL);
    await page.getByRole('textbox', { name: 'Password*' }).fill('WrongPassword');
    await page.getByRole('checkbox', { name: 'Remember me' }).check();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('These credentials do not match our records')).toBeVisible({ timeout: 5000 });
    console.log('✅ Incorrect password correctly rejected.');
  });

test('TC-002 | Login fails with incorrect TOTP', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('textbox', { name: 'Email address*' }).fill(EMAIL);
    await page.getByRole('textbox', { name: 'Password*' }).fill(PASSWORD);
    await page.getByRole('checkbox', { name: 'Remember me' }).check();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('textbox', { name: 'Enter the 6-digit code from' }).fill('000000'); // Deliberately wrong OTP
    await page.getByRole('button', { name: 'Confirm sign in' }).click();
    await expect(page.getByText('The code you entered is invalid')).toBeVisible({ timeout: 5000 });
    console.log('✅ Incorrect TOTP correctly rejected.');
  });

  /*

  
  // ── TC-003: Login fails with empty credentials ─────────────────────────────
  test('TC-003 | Login fails with empty email and password', async ({ page }) => {
    await page.getByRole('button', { name: /login|sign in|submit/i }).click();

    // Expect validation messages
    const emailError = page.locator('text=/email.*required|enter.*email/i');
    const passError  = page.locator('text=/password.*required|enter.*password/i');

    const eitherVisible = (await emailError.isVisible()) || (await passError.isVisible());
    expect(eitherVisible).toBeTruthy();

    console.log('✅ Empty form submission correctly blocked.');
  });

  // ── TC-004: Login fails with invalid TOTP code ─────────────────────────────
  test('TC-004 | Login fails with invalid TOTP code', async ({ page }) => {
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password/i).fill(PASSWORD);
    await page.getByRole('button', { name: /login|sign in|submit/i }).click();

    const totpInput = page.getByLabel(/code|otp|two.factor|authenticator/i);
    await expect(totpInput).toBeVisible({ timeout: 10_000 });

    await totpInput.fill('000000'); // deliberate wrong OTP
    await page.getByRole('button', { name: /verify|confirm|submit|continue/i }).click();

    const errorMsg = page.locator('text=/invalid|incorrect|wrong|expired/i');
    await expect(errorMsg).toBeVisible({ timeout: 8_000 });

    console.log('✅ Invalid TOTP correctly rejected.');
  });

  */