import { expect, Page } from '@playwright/test';
import { generateTOTP } from './totp.helper';

const BASE_URL = 'https://hris.itmanage.com.au/login';
const EMAIL = 'kamal@ictechnology.com.au';
const PASSWORD = 'Password01';
const TOTP_SECRET = 'SQGN3PT4AEMC56BS';

export async function login(page: Page) {
  await page.goto(BASE_URL);

  await page.getByRole('textbox', { name: 'Email address*' }).fill(EMAIL);
  await page.getByRole('textbox', { name: 'Password*' }).fill(PASSWORD);
  await page.getByRole('checkbox', { name: 'Remember me' }).check();
  await page.getByRole('button', { name: 'Sign in' }).click();

  const totpInput = page.getByRole('textbox', {
    name: 'Enter the 6-digit code from'
  });

  await expect(totpInput).toBeVisible();

  const otpCode = generateTOTP(TOTP_SECRET);
  await totpInput.fill(otpCode);

  await page.getByRole('button', { name: 'Confirm sign in' }).click();

  await expect(
    page.getByRole('heading', { name: 'Dashboard' })
  ).toBeVisible();
}