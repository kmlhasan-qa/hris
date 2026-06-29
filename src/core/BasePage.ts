import { Page, Locator, expect } from '@playwright/test';

/**
 * Shared navigation + ready-state primitives for every page object.
 *
 * - Navigates by RELATIVE path so `baseURL` controls the environment.
 * - Replaces `waitForLoadState('networkidle')` with an explicit wait on a
 *   "page is ready" locator — the only signal that actually means the page is
 *   usable.
 * - Fails fast with a clear message if the stored session has expired
 *   (cheap URL check, no extra navigation round-trip per test).
 */
export abstract class BasePage {
  constructor(public readonly page: Page) {}

  /**
   * Navigate to `path` and wait until `ready` is visible.
   * @param ready a locator that is present only once the page is interactive.
   */
  protected async open(path: string, ready: Locator): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });

    if (this.page.url().includes('/login')) {
      throw new Error(
        `Session expired: navigation to "${path}" was redirected to /login. ` +
          'Re-run global setup to refresh playwright/.auth/user.json.',
      );
    }

    await expect(ready).toBeVisible();
  }
}
