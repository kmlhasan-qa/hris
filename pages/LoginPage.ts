import { Page, expect } from '@playwright/test';
import { generateTOTP } from '../helpers/totp.helper';

export class LoginPage {
  constructor(private page: Page) {}

  // ── Locators ─────────────────────────────
  emailInput = () =>
    this.page.getByRole('textbox', { name: 'Email address*' });

  passwordInput = () =>
    this.page.getByRole('textbox', { name: 'Password*' });

  rememberMe = () =>
    this.page.getByRole('checkbox', { name: 'Remember me' });

  signInButton = () =>
    this.page.getByRole('button', { name: 'Sign in' });

  otpInput = () =>
    this.page.getByRole('textbox', {
      name: 'Enter the 6-digit code from',
    });

  confirmButton = () =>
    this.page.getByRole('button', { name: 'Confirm sign in' });

  errorMessage = (text: string) =>
    this.page.getByText(text);

  dashboardTitle = () =>
    this.page.getByRole('heading', { name: 'Dashboard' });

  // ── Actions ─────────────────────────────
  async goto(url: string) {
    await this.page.goto(url);
  }

  async login(email: string, password: string, totpSecret: string) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.rememberMe().check();
    await this.signInButton().click();

    await expect(this.otpInput()).toBeVisible();

    await this.otpInput().fill(generateTOTP(totpSecret));
    await this.confirmButton().click();

    await expect(this.dashboardTitle()).toBeVisible();
  }

  async loginWithWrongPassword(email: string, password: string) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.rememberMe().check();
    await this.signInButton().click();
  }

  async submitOtp(code: string) {
    await this.otpInput().fill(code);
    await this.confirmButton().click();
  }
}