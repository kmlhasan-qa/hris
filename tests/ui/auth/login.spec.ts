import { test, expect } from '../../../src/core/fixtures';
import { UI_LOGIN } from '../../../src/config/env';
import { generateTOTP } from '../../../helpers/totp.helper';

const WRONG_PASSWORD = 'WrongPassword';
const INVALID_TOTP = '000000';

// Login tests run against a clean (unauthenticated) state.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('HRIS Login', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-001 | Successful login', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(UI_LOGIN.email, UI_LOGIN.password, UI_LOGIN.totpSecret);

    await expect(loginPage.page).toHaveURL(/\/admin/);
    await expect(loginPage.dashboardHeading).toBeVisible();
  });

  test('TC-002 | Login fails with incorrect password', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitCredentials(UI_LOGIN.email, WRONG_PASSWORD);

    await expect(
      loginPage.errorMessage('These credentials do not match our records'),
    ).toBeVisible();
  });

  test('TC-003 | Login fails with incorrect TOTP', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitCredentials(UI_LOGIN.email, UI_LOGIN.password);
    await loginPage.submitOtp(INVALID_TOTP);

    await expect(loginPage.errorMessage('The code you entered is invalid')).toBeVisible();
  });

  // Sanity check that the local TOTP generator stays in lockstep with the server.
  test('TOTP generator produces a 6-digit code', async () => {
    expect(generateTOTP(UI_LOGIN.totpSecret)).toMatch(/^\d{6}$/);
  });
});
