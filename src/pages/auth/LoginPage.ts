import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../core/BasePage';
import { routes } from '../../config/routes';
import { generateTOTP } from '../../../helpers/totp.helper';

/**
 * Login page (email/password + TOTP). Uses robust role-based locators — these
 * are the user-facing accessibility names, stable across Filament restyles.
 *
 * This is the single canonical login implementation, reused by the login spec,
 * the auth fixture, and global setup.
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMe: Locator;
  readonly signInButton: Locator;
  readonly otpInput: Locator;
  readonly confirmButton: Locator;
  readonly dashboardHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByRole('textbox', { name: 'Email address*' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password*' });
    this.rememberMe = page.getByRole('checkbox', { name: 'Remember me' });
    this.signInButton = page.getByRole('button', { name: /sign in/i });
    this.otpInput = page.getByRole('textbox', { name: /enter the 6-digit code/i });
    this.confirmButton = page.getByRole('button', { name: /confirm sign in/i });
    this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.login, { waitUntil: 'domcontentloaded' });
    await expect(this.emailInput).toBeVisible();
  }

  /** Submit credentials only (stops at the TOTP step). */
  async submitCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.rememberMe.check();
    await this.signInButton.click();
  }

  async submitOtp(code: string): Promise<void> {
    await expect(this.otpInput).toBeVisible();
    await this.otpInput.fill(code);
    await this.confirmButton.click();
  }

  /** Full happy-path login through to the dashboard. */
  async login(email: string, password: string, totpSecret: string): Promise<void> {
    await this.submitCredentials(email, password);
    await this.submitOtp(generateTOTP(totpSecret));
    await expect(this.dashboardHeading).toBeVisible();
  }

  errorMessage(text: string | RegExp): Locator {
    return this.page.getByText(text);
  }
}
