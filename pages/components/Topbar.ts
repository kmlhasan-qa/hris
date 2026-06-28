import { Page, Locator, expect } from '@playwright/test';

export class Topbar {
  readonly searchInput: Locator;
  readonly profileAvatar: Locator;

  constructor(private page: Page) {
    this.searchInput = page.getByPlaceholder(/search/i);
    this.profileAvatar = page.locator('text=TA');
  }

  async verifyVisible() {
    await expect(this.searchInput).toBeVisible();
    await expect(this.profileAvatar).toBeVisible();
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
  }
}