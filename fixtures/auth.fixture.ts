import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { generateTOTP } from '../helpers/totp.helper';

type AuthFixtures = {
  loginPage: LoginPage;
  authenticatedPage: Page;
  login: (email: string, password: string, secret: string) => Promise<void>;
};

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  authenticatedPage: async ({ page }, use) => {
    // this will be used only when you want pre-authenticated state
    await use(page);
  },

  login: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    const loginFn = async (
      email: string,
      password: string,
      secret: string
    ) => {
      await loginPage.goto('https://hris.itmanage.com.au/login');

      await loginPage.emailInput().fill(email);
      await loginPage.passwordInput().fill(password);
      await loginPage.rememberMe().check();
      await loginPage.signInButton().click();

      await expect(loginPage.otpInput()).toBeVisible();

      await loginPage
        .otpInput()
        .fill(generateTOTP(secret));

      await loginPage.confirmButton().click();

      await expect(loginPage.dashboardTitle()).toBeVisible();
    };

    await use(loginFn);
  },
});

export { expect };