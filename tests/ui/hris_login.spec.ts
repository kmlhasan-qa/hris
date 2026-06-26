import { test, expect } from '../../fixtures/auth.fixture.js';

const BASE_URL = 'https://hris.itmanage.com.au/login';

const EMAIL = 'kamal@ictechnology.com.au';
const PASSWORD = 'Password01';
const WRONG_PASSWORD = 'WrongPassword';
const TOTP_SECRET = 'SQGN3PT4AEMC56BS';

test.describe('HRIS Login', () => {
  test('TC-001 | Successful login', async ({ login }) => {
    await login(EMAIL, PASSWORD, TOTP_SECRET);

    console.log('✅ Successful login.');
  });

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
    ).toBeVisible({ timeout: 5000 });

    console.log('✅ Incorrect password correctly rejected.');
  });

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

    // OTP step
    await page
      .getByRole('textbox', {
        name: 'Enter the 6-digit code from',
      })
      .fill('000000');

    await page
      .getByRole('button', { name: 'Confirm sign in' })
      .click();

    await expect(
      page.getByText('The code you entered is invalid')
    ).toBeVisible({ timeout: 5000 });

    console.log('✅ Incorrect TOTP correctly rejected.');
  });
});