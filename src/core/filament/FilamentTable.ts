import { Page, Locator, expect } from '@playwright/test';
import { waitForLivewire } from './livewire';

/**
 * Reusable wrapper around a Filament table (`.fi-ta-*`).
 *
 * Departments and Push Notifications render the SAME table component, so the
 * fragile framework selectors live here ONCE. When Filament changes its markup,
 * this is the only file to touch — not every page object and spec.
 *
 * Every mutating interaction waits on the Livewire re-render instead of a fixed
 * timeout, then leaves the explicit assertion to the caller.
 */
export class FilamentTable {
  readonly rows: Locator;
  readonly search: Locator;
  readonly emptyState: Locator;
  readonly paginationOverview: Locator;
  readonly nextPageButton: Locator;
  readonly paginationItems: Locator;
  readonly perPageSelect: Locator;

  constructor(private readonly page: Page) {
    this.rows = page.locator('tbody tr.fi-ta-row');
    this.search = page.locator('input[wire\\:model\\.live\\.debounce\\.500ms="tableSearch"]');
    this.emptyState = page.locator('.fi-ta-empty-state');
    this.paginationOverview = page.locator('span.fi-pagination-overview');
    this.nextPageButton = page.locator('button.fi-pagination-next-btn').first();
    this.paginationItems = page.locator('ol.fi-pagination-items li.fi-pagination-item');
    this.perPageSelect = page.locator('select[wire\\:model\\.live="tableRecordsPerPage"]').first();
  }

  // ── Search ────────────────────────────────────────────────────────────────
  async filterBy(text: string): Promise<void> {
    await waitForLivewire(this.page, () => this.search.fill(text), { strict: true });
  }

  async clearSearch(): Promise<void> {
    await waitForLivewire(this.page, () => this.search.fill(''), { strict: true });
    await expect(this.search).toHaveValue('');
  }

  // ── Rows / cells ────────────────────────────────────────────────────────────
  rowCount(): Promise<number> {
    return this.rows.count();
  }

  row(index: number): Locator {
    return this.rows.nth(index);
  }

  /** A table cell by Filament column key, e.g. cell(0, 'name'). */
  cell(index: number, columnKey: string): Locator {
    return this.row(index).locator(`td.fi-ta-cell-${columnKey}`);
  }

  async cellText(index: number, columnKey: string): Promise<string> {
    const cell = this.cell(index, columnKey);
    const textNode = cell.locator('.fi-ta-text');
    const target = (await textNode.count()) > 0 ? textNode.first() : cell;
    return (await target.innerText()).trim();
  }

  header(columnKey: string): Locator {
    return this.page.locator(`th.fi-ta-header-cell-${columnKey}`);
  }

  async sortBy(columnKey: string): Promise<void> {
    await waitForLivewire(
      this.page,
      () => this.header(columnKey).locator('.fi-ta-header-cell-sort-btn').click(),
      { strict: true }
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  async hasNoResults(): Promise<boolean> {
    if ((await this.rowCount()) === 0) return true;
    return this.emptyState.isVisible().catch(() => false);
  }

  // ── Pagination ──────────────────────────────────────────────────────────────
  async paginationOverviewText(): Promise<string> {
    return (await this.paginationOverview.innerText()).trim();
  }

  async goToNextPage(): Promise<void> {
    await waitForLivewire(this.page, () => this.nextPageButton.click(), { strict: true });
  }

  async goToPage(pageNumber: number): Promise<void> {
    await waitForLivewire(
      this.page,
      () => this.paginationItems.filter({ hasText: String(pageNumber) }).first().click(),
      { strict: true }
    );
  }

  async setPerPage(value: '5' | '10' | '25' | '50'): Promise<void> {
    await waitForLivewire(this.page, () => this.perPageSelect.selectOption(value), { strict: true });
  }

  async activePage(): Promise<number> {
    const active = this.page.locator('li.fi-pagination-item.fi-active');
    const label = await active.locator('.fi-pagination-item-label, button').first().innerText();
    return parseInt(label.trim(), 10);
  }
}
