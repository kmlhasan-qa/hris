import { Page, Locator } from '@playwright/test';

/** Filament admin topbar (global search + user menu). */
export class Topbar {
  readonly searchInput: Locator;
  readonly userMenuTrigger: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page.getByPlaceholder(/search/i);
    this.userMenuTrigger = page.locator('.fi-user-menu-trigger');
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
  }
}
