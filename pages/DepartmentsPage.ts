import { expect, Locator, Page } from '@playwright/test';

export class DepartmentsPage {
  readonly page: Page;

  // ─── Navigation ────────────────────────────────────────────────────────────
  readonly BASE_URL = 'https://hris.itmanage.com.au';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(`${this.BASE_URL}/admin/departments`);
    await this.page.waitForLoadState('networkidle');
  }

  // ─── Header ────────────────────────────────────────────────────────────────
  get pageHeading(): Locator {
    return this.page.locator('h1.fi-header-heading');
  }

  get breadcrumbItems(): Locator {
    return this.page.locator('ol.fi-breadcrumbs-list li');
  }

  get breadcrumbDepartments(): Locator {
    return this.page.locator('ol.fi-breadcrumbs-list li a', { hasText: 'Departments' });
  }

  get addNewButton(): Locator {
    return this.page.locator('a.fi-ac-btn-action', { hasText: 'Add New Department' });
  }

  // ─── Search ────────────────────────────────────────────────────────────────
  get searchInput(): Locator {
    return this.page.locator('input[wire\\:model\\.live\\.debounce\\.500ms="tableSearch"]');
  }

  async fillSearch(text: string) {
    await this.searchInput.fill(text);
    await this.page.waitForTimeout(600);
    await this.page.waitForLoadState('networkidle');
  }

  async clearSearch() {
    await this.searchInput.fill('');
    await this.page.waitForTimeout(600);
    await this.page.waitForLoadState('networkidle');
  }

  // ─── Table ─────────────────────────────────────────────────────────────────
  get tableRows(): Locator {
    return this.page.locator('tbody tr.fi-ta-row');
  }

  async getRowCount(): Promise<number> {
    return this.tableRows.count();
  }

  async getRowByIndex(index: number): Promise<Locator> {
    return this.tableRows.nth(index);
  }

  async getRowDepartmentNameByIndex(index: number): Promise<string> {
    const row = this.tableRows.nth(index);
    return (await row.locator('td.fi-ta-cell-name .fi-ta-text').innerText()).trim();
  }

  async getRowHeadOfDeptByIndex(index: number): Promise<string> {
    const row = this.tableRows.nth(index);
    return (await row.locator('td.fi-ta-cell-head-employee\\.name .fi-ta-text').innerText()).trim();
  }

  async getRowEnabledStatusByIndex(index: number): Promise<boolean> {
    const row = this.tableRows.nth(index);
    const icon = row.locator('td.fi-ta-cell-is-enabled .fi-ta-icon svg');
    return icon.isVisible();
  }

  async clickRowDepartmentName(index: number) {
    const row = this.tableRows.nth(index);
    await row.locator('td.fi-ta-cell-name a.fi-ta-col').click();
  }

  // ─── Table Headers ──────────────────────────────────────────────────────────
  get headerDepartmentName(): Locator {
    return this.page.locator('th.fi-ta-header-cell-name');
  }

  get headerHeadOfDept(): Locator {
    return this.page.locator('th.fi-ta-header-cell-head-employee\\.name');
  }

  get headerEnabled(): Locator {
    return this.page.locator('th.fi-ta-header-cell-is-enabled');
  }

  async assertTableHeadersVisible() {
    await expect(this.headerDepartmentName).toBeVisible();
    await expect(this.headerHeadOfDept).toBeVisible();
    await expect(this.headerEnabled).toBeVisible();
  }

  // ─── Sorting ───────────────────────────────────────────────────────────────
  async sortByDepartmentName() {
    await this.headerDepartmentName.locator('.fi-ta-header-cell-sort-btn').click();
    await this.page.waitForLoadState('networkidle');
  }

  async sortByHeadOfDept() {
    await this.headerHeadOfDept.locator('.fi-ta-header-cell-sort-btn').click();
    await this.page.waitForLoadState('networkidle');
  }

  async sortByEnabled() {
    await this.headerEnabled.locator('.fi-ta-header-cell-sort-btn').click();
    await this.page.waitForLoadState('networkidle');
  }

  // ─── Row Actions ───────────────────────────────────────────────────────────
  async getEditLinkByIndex(index: number): Promise<Locator> {
    const row = this.tableRows.nth(index);
    return row.locator('a.fi-ac-link-action', { hasText: 'Edit' });
  }

  async clickEditByIndex(index: number) {
    const editLink = await this.getEditLinkByIndex(index);
    await editLink.click();
  }

  // ─── Pagination ────────────────────────────────────────────────────────────
  get paginationOverview(): Locator {
    return this.page.locator('span.fi-pagination-overview');
  }

  get paginationItems(): Locator {
    return this.page.locator('ol.fi-pagination-items li.fi-pagination-item');
  }

  get nextPageButton(): Locator {
    return this.page.locator('button.fi-pagination-next-btn').first();
  }

  get recordsPerPageSelect(): Locator {
    return this.page.locator('select[wire\\:model\\.live="tableRecordsPerPage"]').first();
  }

  async getPaginationOverviewText(): Promise<string> {
    return (await this.paginationOverview.innerText()).trim();
  }

  async getActivePage(): Promise<number> {
    const activeItem = this.page.locator('li.fi-pagination-item.fi-active');
    const label = await activeItem.locator('.fi-pagination-item-label').innerText();
    return parseInt(label.trim(), 10);
  }

  async goToNextPage() {
    await this.nextPageButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToPage(pageNumber: number) {
    const pageBtn = this.page.locator(`li.fi-pagination-item`, { hasText: String(pageNumber) });
    await pageBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async setRecordsPerPage(value: '5' | '10' | '25' | '50') {
    await this.recordsPerPageSelect.selectOption(value);
    await this.page.waitForLoadState('networkidle');
  }

  // ─── Filter ────────────────────────────────────────────────────────────────
  get filterButton(): Locator {
    return this.page.locator('button.fi-ac-icon-btn-action[title="Filter"]');
  }

  get filterPanel(): Locator {
    return this.page.locator('div.fi-ta-filters');
  }

  get filterHeadOfDeptSelect(): Locator {
    return this.page.locator('[wire\\:key*="tableFiltersForm.headEmployee.values"] .fi-select-input-btn');
  }

  get filterStatusSelect(): Locator {
    return this.page.locator('[wire\\:key*="tableFiltersForm.is_enabled.value"] .fi-select-input-btn');
  }

  get filterDeletedRecordsSelect(): Locator {
    return this.page.locator('[wire\\:key*="tableFiltersForm.trashed.value"] .fi-select-input-btn');
  }

  get filterApplyButton(): Locator {
    return this.filterPanel.locator('button', { hasText: 'Apply filters' });
  }

  get filterResetButton(): Locator {
    return this.filterPanel.locator('button', { hasText: 'Reset' });
  }

  get filterBadge(): Locator {
    return this.filterButton.locator('..').locator('.fi-badge');
  }

  async openFilter() {
    const isVisible = await this.filterPanel.isVisible().catch(() => false);
    if (!isVisible) {
      await this.filterButton.click();
      await expect(this.filterPanel).toBeVisible({ timeout: 10_000 });
    }
  }

  async closeFilter() {
    await this.page.keyboard.press('Escape');
    await expect(this.filterPanel).not.toBeVisible({ timeout: 10_000 });
  }

  async applyFilter() {
    await this.filterApplyButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async resetFilter() {
    await this.filterResetButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getFilterBadgeCount(): Promise<number> {
    const text = await this.filterBadge.innerText().catch(() => '0');
    return parseInt(text.trim(), 10);
  }

  async selectHeadOfDeptFilter(employeeName: string) {
    await this.filterHeadOfDeptSelect.click();
    const option = this.page
      .locator('[role="option"], li.fi-dropdown-list-item')
      .filter({ hasText: employeeName })
      .first();
    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();
  }

  async selectStatusFilter(status: 'Enabled' | 'Disabled') {
    await this.filterStatusSelect.click();
    const option = this.page
      .locator('[role="option"], li.fi-dropdown-list-item')
      .filter({ hasText: status })
      .first();
    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();
  }

  // ─── Sidebar ───────────────────────────────────────────────────────────────
  get sidebar(): Locator {
    return this.page.locator('aside.fi-sidebar');
  }

  get activeSidebarItem(): Locator {
    return this.page.locator('li.fi-sidebar-item.fi-active');
  }

  // ─── Page Assertions ───────────────────────────────────────────────────────
  async assertOnPage() {
    await expect(this.pageHeading).toHaveText('Departments');
  }

  async assertBreadcrumbs() {
    const items = this.breadcrumbItems;
    await expect(items).toHaveCount(2);
  }
}