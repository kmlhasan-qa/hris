import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../core/BasePage';
import { FilamentTable } from '../../core/filament/FilamentTable';
import { FilamentFilters } from '../../core/filament/FilamentFilters';
import { routes } from '../../config/routes';

/** Push Notifications list page. Locators + actions only. */
export class PushNotificationsListPage extends BasePage {
  readonly table = new FilamentTable(this.page);
  readonly filters = new FilamentFilters(this.page);

  readonly heading: Locator;
  readonly breadcrumbList: Locator;
  readonly sendNewButton: Locator;
  readonly filterEmployeeSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('h1.fi-header-heading');
    this.breadcrumbList = page.locator('nav.fi-breadcrumbs span', { hasText: 'List' });
    this.sendNewButton = page.getByRole('link', { name: /send new push notifications/i });
    this.filterEmployeeSelect = page.locator(
      '[wire\\:key*="tableFiltersForm.employees.value"] .fi-select-input-btn',
    );
  }

  goto(): Promise<void> {
    return this.open(routes.pushNotifications.list, this.heading);
  }

  // ── Column accessors ──────────────────────────────────────────────────────
  title(row: number): Promise<string> {
    return this.table.cellText(row, 'title');
  }

  body(row: number): Promise<string> {
    return this.table.cellText(row, 'body');
  }

  sentAt(row: number): Promise<string> {
    return this.table.cellText(row, 'created-at');
  }

  rowImage(row: number): Locator {
    return this.table.cell(row, 'image-path').locator('img');
  }

  async recipientsCount(row: number): Promise<number> {
    const text = await this.table.cell(row, 'recipients-count').locator('.fi-badge').innerText();
    return parseInt(text.trim() || '0', 10);
  }

  clickSendNew(): Promise<void> {
    return this.sendNewButton.click();
  }
}
