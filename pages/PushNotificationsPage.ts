import { Page, Locator, expect } from '@playwright/test';

export class PushNotificationsPage {
  readonly page: Page;

  // ─── Header ───────────────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly breadcrumbPushNotifications: Locator;
  readonly breadcrumbList: Locator;
  readonly sendNewButton: Locator;

  // ─── Search ───────────────────────────────────────────────────────────────
  readonly searchInput: Locator;

  // ─── Filter ───────────────────────────────────────────────────────────────
  readonly filterButton: Locator;
  readonly filterBadgeCount: Locator;
  readonly filterPanel: Locator;
  readonly filterEmployeeSelect: Locator;
  readonly filterApplyButton: Locator;
  readonly filterResetButton: Locator;

  // ─── Table ────────────────────────────────────────────────────────────────
  readonly tableHeaderTitle: Locator;
  readonly tableHeaderBody: Locator;
  readonly tableHeaderRecipients: Locator;
  readonly tableHeaderImage: Locator;
  readonly tableHeaderSentAt: Locator;
  readonly tableRows: Locator;

  // ─── Pagination ───────────────────────────────────────────────────────────
  readonly paginationOverview: Locator;
  readonly paginationNextBtn: Locator;
  readonly paginationItems: Locator;
  readonly perPageSelect: Locator;

  // ─── Sidebar ──────────────────────────────────────────────────────────────
  readonly sidebar: Locator;
  readonly activeSidebarItem: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.pageHeading         = page.locator('h1.fi-header-heading');
    this.breadcrumbPushNotifications = page.locator('nav.fi-breadcrumbs a', { hasText: 'Push Notifications' });
    this.breadcrumbList      = page.locator('nav.fi-breadcrumbs span', { hasText: 'List' });
    this.sendNewButton       = page.locator('a', { hasText: 'Send New Push Notifications' });

    // Search
    this.searchInput         = page.locator('input[type="search"][wire\\:model\\.live\\.debounce\\.500ms="tableSearch"]');

    // Filter
    this.filterButton        = page.locator('button.fi-icon-btn[title="Filter"]');
    this.filterBadgeCount    = page.locator('.fi-ta-filters-dropdown .fi-icon-btn-badge-ctn .fi-badge');
    this.filterPanel         = page.locator('.fi-ta-filters');
    this.filterEmployeeSelect = page.locator('[wire\\:key*="tableFiltersForm.employees.value"] .fi-select-input-btn');
    this.filterApplyButton   = page.locator('button[wire\\:click="applyTableFilters"]');
    this.filterResetButton   = page.locator('button[wire\\:click="resetTableFiltersForm"]');

    // Table headers
    this.tableHeaderTitle     = page.locator('th.fi-ta-header-cell-title');
    this.tableHeaderBody      = page.locator('th.fi-ta-header-cell-body');
    this.tableHeaderRecipients = page.locator('th.fi-ta-header-cell-recipients-count');
    this.tableHeaderImage     = page.locator('th.fi-ta-header-cell-image-path');
    this.tableHeaderSentAt    = page.locator('th.fi-ta-header-cell-created-at');
    this.tableRows            = page.locator('tbody tr.fi-ta-row');

    // Pagination
    this.paginationOverview  = page.locator('span.fi-pagination-overview');
    this.paginationNextBtn   = page.locator('button.fi-pagination-next-btn').first();
    this.paginationItems     = page.locator('ol.fi-pagination-items li.fi-pagination-item');
    this.perPageSelect       = page.locator('select[wire\\:model\\.live="tableRecordsPerPage"]').first();

    // Sidebar
    this.sidebar             = page.locator('aside.fi-sidebar');
    this.activeSidebarItem   = page.locator('li.fi-sidebar-item.fi-active');
  }

  // ─── Navigation ───────────────────────────────────────────────────────────
  async goto() {
    await this.page.goto('https://hris.itmanage.com.au/admin/push-notifications');
    await expect(this.pageHeading).toBeVisible({ timeout: 15000 });
  }

  // ─── Assertions ───────────────────────────────────────────────────────────
  async assertOnPage() {
    await expect(this.pageHeading).toHaveText('Push Notifications');
    await expect(this.page).toHaveURL(/push-notifications/);
  }

  async assertBreadcrumbs() {
    await expect(this.breadcrumbPushNotifications).toBeVisible();
    await expect(this.breadcrumbList).toBeVisible();
  }

  async assertTableHeadersVisible() {
    await expect(this.tableHeaderTitle).toBeVisible();
    await expect(this.tableHeaderBody).toBeVisible();
    await expect(this.tableHeaderRecipients).toBeVisible();
    await expect(this.tableHeaderImage).toBeVisible();
    await expect(this.tableHeaderSentAt).toBeVisible();
  }

  // ─── Search ───────────────────────────────────────────────────────────────
  async fillSearch(text: string) {
    await this.searchInput.fill(text);
  }

  async clearSearch() {
    await this.searchInput.fill('');
  }

  // ─── Filter ───────────────────────────────────────────────────────────────
  async openFilter() {
    await this.filterButton.click();
    await expect(this.filterPanel).toBeVisible();
  }

  async closeFilter() {
    await this.page.keyboard.press('Escape');
  }

  async applyFilter() {
    await this.filterApplyButton.click();
  }

  async resetFilter() {
    await this.filterResetButton.click();
  }

  async getFilterBadgeCount(): Promise<number> {
    const text = await this.filterBadgeCount.textContent();
    return parseInt(text?.trim() || '0', 10);
  }

  // ─── Table ────────────────────────────────────────────────────────────────
  async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async getRowByIndex(index: number): Promise<Locator> {
    return this.tableRows.nth(index);
  }

  async getRowTitleByIndex(index: number): Promise<string> {
    const row = this.tableRows.nth(index);
    return (await row.locator('td.fi-ta-cell-title').textContent())?.trim() ?? '';
  }

  async getRowBodyByIndex(index: number): Promise<string> {
    const row = this.tableRows.nth(index);
    return (await row.locator('td.fi-ta-cell-body').textContent())?.trim() ?? '';
  }

  async getRowRecipientsCountByIndex(index: number): Promise<number> {
    const row = this.tableRows.nth(index);
    const text = await row.locator('td.fi-ta-cell-recipients-count .fi-badge').textContent();
    return parseInt(text?.trim() || '0', 10);
  }

  async getRowSentAtByIndex(index: number): Promise<string> {
    const row = this.tableRows.nth(index);
    return (await row.locator('td.fi-ta-cell-created-at').textContent())?.trim() ?? '';
  }

  async clickViewOnRow(index: number) {
    const row = this.tableRows.nth(index);
    await row.locator('a', { hasText: 'View' }).click();
  }

  async clickRowTitle(index: number) {
    const row = this.tableRows.nth(index);
    await row.locator('td.fi-ta-cell-title a').click();
  }

  async assertRowHasImage(index: number): Promise<boolean> {
    const row = this.tableRows.nth(index);
    return await row.locator('td.fi-ta-cell-image-path img').isVisible();
  }

  // ─── Sort ─────────────────────────────────────────────────────────────────
  async sortByTitle() {
    await this.tableHeaderTitle.locator('.fi-ta-header-cell-sort-btn').click();
  }

  async sortBySentAt() {
    await this.tableHeaderSentAt.locator('.fi-ta-header-cell-sort-btn').click();
  }

  // ─── Pagination ───────────────────────────────────────────────────────────
  async getPaginationOverviewText(): Promise<string> {
    return (await this.paginationOverview.textContent())?.trim() ?? '';
  }

  async goToNextPage() {
    await this.paginationNextBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToPage(pageNumber: number) {
    await this.page.locator(`ol.fi-pagination-items li[wire\\:key*=".pagination.page.${pageNumber}"]`).click();
    await this.page.waitForLoadState('networkidle');
  }

  async setPerPage(value: '5' | '10' | '25' | '50') {
    await this.perPageSelect.selectOption(value);
    await this.page.waitForLoadState('networkidle');
  }

  async getActivePage(): Promise<number> {
    const active = this.page.locator('ol.fi-pagination-items li.fi-pagination-item.fi-active');
    const text = await active.locator('button').textContent();
    return parseInt(text?.trim() || '1', 10);
  }

  // ─── Navigation shortcuts ─────────────────────────────────────────────────
  async clickSendNew() {
    await this.sendNewButton.click();
  }
}