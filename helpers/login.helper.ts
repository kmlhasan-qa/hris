import { expect, type Page } from '@playwright/test';
import { UI_LOGIN } from './config';
import { generateTOTP } from './totp.helper';

/** Drive the browser login flow (email/password + TOTP) through to the dashboard. */
export async function login(page: Page): Promise<void> {
  await page.goto(UI_LOGIN.url);

  await page.getByRole('textbox', { name: 'Email address*' }).fill(UI_LOGIN.email);
  await page.getByRole('textbox', { name: 'Password*' }).fill(UI_LOGIN.password);
  await page.getByRole('checkbox', { name: 'Remember me' }).check();
  await page.getByRole('button', { name: 'Sign in' }).click();

  const totpInput = page.getByRole('textbox', { name: 'Enter the 6-digit code from' });
  await expect(totpInput).toBeVisible();
  await totpInput.fill(generateTOTP(UI_LOGIN.totpSecret));

  await page.getByRole('button', { name: 'Confirm sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}
