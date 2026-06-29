import { Page, Locator, expect } from '@playwright/test';
import { waitForLivewire } from './livewire';

/**
 * Reusable wrapper around a Filament table filter dropdown.
 *
 * Open/close/apply/reset/badge behaviour is identical across resources; only the
 * specific filter <select>s differ, so page objects expose those individually
 * while delegating the panel mechanics here.
 */
export class FilamentFilters {
  readonly trigger: Locator;
  readonly panel: Locator;
  readonly applyButton: Locator;
  readonly resetButton: Locator;
  readonly badge: Locator;

  constructor(private readonly page: Page) {
    this.trigger = page.locator('button[title="Filter"]');
    this.panel = page.locator('div.fi-ta-filters');
    this.applyButton = this.panel.getByRole('button', { name: /apply filters/i });
    this.resetButton = this.panel.getByRole('button', { name: /reset/i });
    this.badge = page.locator('.fi-ta-filters-dropdown .fi-badge').first();
  }

  /** Filament keeps the panel mounted; only open it if not already visible. */
  async open(): Promise<void> {
    if (await this.panel.isVisible().catch(() => false)) return;
    await this.trigger.first().click();
    await expect(this.panel).toBeVisible();
  }

  async close(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.panel).not.toBeVisible();
  }

  async apply(): Promise<void> {
    await waitForLivewire(this.page, () => this.applyButton.click());
  }

  async reset(): Promise<void> {
    await waitForLivewire(this.page, () => this.resetButton.click());
  }

  async badgeCount(): Promise<number> {
    const text = await this.badge.innerText().catch(() => '0');
    return parseInt(text.trim() || '0', 10);
  }

  /** Pick an option from an open Filament select dropdown by visible text. */
  async chooseOption(select: Locator, optionText: string): Promise<void> {
    await select.click();
    const option = this.page
      .locator('[role="option"], li.fi-dropdown-list-item')
      .filter({ hasText: optionText })
      .first();
    await expect(option).toBeVisible();
    await option.click();
  }
}
