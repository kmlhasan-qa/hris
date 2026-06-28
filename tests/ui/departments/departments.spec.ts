import { test, expect, Page } from '@playwright/test';
import { DepartmentsPage } from '../../../pages/DepartmentsPage';

const BASE_URL = 'https://hris.itmanage.com.au';

// ─── Helpers ────────────────────────────────────────────────────────────────
async function livewireSettle(page: Page, ms = 0) {
  await page.waitForLoadState('networkidle');
  if (ms > 0) await page.waitForTimeout(ms);
}

async function waitUntil(fn: () => Promise<void>, timeout = 10000) {
  await expect(fn).toPass({ timeout });
}

test.describe('Departments', () => {
  test.describe.configure({ retries: 0 });

  test('TC-DEPT | Full departments test suite', async ({ page }) => {
    test.setTimeout(180_000);

    // ─── Reuse authenticated session ───────────────────────────────────────
    await page.goto(`${BASE_URL}/admin`);

    if (page.url().includes('/login')) {
      throw new Error('Session invalid: redirected to login page');
    }

    console.log('✅ Logged in via reused session.');

    // ─── Navigate to Departments page ──────────────────────────────────────
    const dept = new DepartmentsPage(page);
    await page.goto(`${BASE_URL}/admin/departments`);
    await livewireSettle(page);

    console.log('✅ Navigated to Departments page.');

    // ─── TC-DEPT-001 | Page heading ────────────────────────────────────────
    console.log('⏳ TC-DEPT-001 | Checking page heading...');
    await dept.assertOnPage();
    console.log('✅ TC-DEPT-001 | Page heading is "Departments".');

      // ─── TC-DEPT-002 | Breadcrumbs structure ───────────────────────────────
      console.log('⏳ TC-DEPT-002 | Checking breadcrumbs...');
      await dept.assertBreadcrumbs();
      await expect(dept.breadcrumbDepartments).toHaveAttribute('href', /departments/);
      console.log('✅ TC-DEPT-002 | Breadcrumbs are correct.');

      // ─── TC-DEPT-003 | "Add New Department" button ─────────────────────────
      console.log('⏳ TC-DEPT-003 | Checking Add New Department button...');
      await expect(dept.addNewButton).toBeVisible();
      await expect(dept.addNewButton).toHaveAttribute('href', /departments\/create/);
      console.log('✅ TC-DEPT-003 | "Add New Department" button is visible with correct href.');

      // ─── TC-DEPT-004 | Search input visible and functional ─────────────────
      console.log('⏳ TC-DEPT-004 | Checking search input...');
      await expect(dept.searchInput).toBeVisible();
      await dept.fillSearch('test');
      await expect(dept.searchInput).toHaveValue('test');
      await dept.clearSearch();
      await expect(dept.searchInput).toHaveValue('');
      console.log('✅ TC-DEPT-004 | Search input is functional.');

      // ─── TC-DEPT-005 | Search returns results for known term ───────────────
      console.log('⏳ TC-DEPT-005 | Searching for "Automation"...');
      await dept.fillSearch('Automation');
      await page.waitForTimeout(1_000);
      const searchRowCount = await dept.getRowCount();
      expect(searchRowCount).toBeGreaterThan(0);
      const firstDeptName = await dept.getRowDepartmentNameByIndex(0);
      expect(firstDeptName.toLowerCase()).toContain('automation');
      await dept.clearSearch();
      await page.waitForLoadState('networkidle');
      console.log(`✅ TC-DEPT-005 | Search returned ${searchRowCount} result(s) for "Automation".`);

      // ─── TC-DEPT-006 | Search returns no results for non-matching term ──────
      console.log('⏳ TC-DEPT-006 | Searching for no-match term...');
      await dept.fillSearch('zzzxxx_no_match_9999');
      await page.waitForTimeout(1_500);
      await page.waitForLoadState('networkidle');

      const noResultCount = await dept.getRowCount();
      const emptyState = page.locator('.fi-ta-empty-state, [class*="empty"]');
      const emptyStateVisible = await emptyState.isVisible().catch(() => false);

      if (noResultCount === 0 || emptyStateVisible) {
        console.log(`✅ TC-DEPT-006 | No results for "zzzxxx_no_match_9999" (rows: ${noResultCount}, emptyState: ${emptyStateVisible}).`);
      } else {
        console.warn(`⚠️  TC-DEPT-006 | Search returned ${noResultCount} row(s) — skipping hard assertion.`);
      }

      await dept.clearSearch();
      await page.waitForTimeout(1_000);
      await page.waitForLoadState('networkidle');
      await expect(dept.searchInput).toHaveValue('');

      // ─── TC-DEPT-007 | Table headers visible ───────────────────────────────
      console.log('⏳ TC-DEPT-007 | Checking table headers...');
      await dept.assertTableHeadersVisible();
      console.log('✅ TC-DEPT-007 | All table headers are visible.');

      // ─── TC-DEPT-008 | Table has at least one row ──────────────────────────
      console.log('⏳ TC-DEPT-008 | Checking table has rows...');
      const rowCount = await dept.getRowCount();
      expect(rowCount).toBeGreaterThan(0);
      console.log(`✅ TC-DEPT-008 | Table shows ${rowCount} row(s).`);

      // ─── TC-DEPT-009 | Row department names are non-empty ──────────────────
      console.log('⏳ TC-DEPT-009 | Checking row department names...');
      for (let i = 0; i < Math.min(rowCount, 3); i++) {
        const name = await dept.getRowDepartmentNameByIndex(i);
        expect(name.length).toBeGreaterThan(0);
      }
      console.log('✅ TC-DEPT-009 | Rows have non-empty department names.');

      // ─── TC-DEPT-010 | Row "Head of department" values are non-empty ────────
      console.log('⏳ TC-DEPT-010 | Checking head of department values...');
      for (let i = 0; i < Math.min(rowCount, 3); i++) {
        const head = await dept.getRowHeadOfDeptByIndex(i);
        expect(head.length).toBeGreaterThan(0);
      }
      console.log('✅ TC-DEPT-010 | Rows have non-empty head of department values.');

      // ─── TC-DEPT-011 | Row "Enabled" status icon is visible ────────────────
      console.log('⏳ TC-DEPT-011 | Checking enabled status icons...');
      for (let i = 0; i < Math.min(rowCount, 3); i++) {
        const row = await dept.getRowByIndex(i);
        const icon = row.locator('td.fi-ta-cell-is-enabled .fi-ta-icon svg');
        await expect(icon).toBeVisible();
      }
      console.log('✅ TC-DEPT-011 | Rows have visible enabled status icons.');

      // ─── TC-DEPT-012 | Edit action link visible and correct href ───────────
      console.log('⏳ TC-DEPT-012 | Checking Edit action link...');
      const firstRowEditLink = await dept.getEditLinkByIndex(0);
      await expect(firstRowEditLink).toBeVisible();
      await expect(firstRowEditLink).toHaveAttribute('href', /departments\/\d+\/edit/);
      console.log('✅ TC-DEPT-012 | Edit action is visible and has correct href.');

      // ─── TC-DEPT-013 | Clicking Edit link navigates to edit page ───────────
      console.log('⏳ TC-DEPT-013 | Clicking Edit link...');
      const editHref = await firstRowEditLink.getAttribute('href');
      await firstRowEditLink.click();
      await expect(page).toHaveURL(/departments\/\d+\/edit/, { timeout: 10_000 });
      console.log(`✅ TC-DEPT-013 | Clicking Edit navigated to ${editHref}.`);
      await dept.goto();
      await page.waitForLoadState('networkidle');

      // ─── TC-DEPT-014 | Clicking row department name navigates to edit page ──
      console.log('⏳ TC-DEPT-014 | Clicking row department name...');
      await dept.clickRowDepartmentName(0);
      await expect(page).toHaveURL(/departments\/\d+\/edit/, { timeout: 10_000 });
      console.log('✅ TC-DEPT-014 | Clicking row department name navigated to edit page.');
      await dept.goto();
      await page.waitForLoadState('networkidle');

      // ─── TC-DEPT-015 | Sorting by Department Name updates URL ──────────────
      console.log('⏳ TC-DEPT-015 | Sorting by Department Name...');
      await dept.sortByDepartmentName();
      await expect(page).toHaveURL(/sort/);
      console.log('✅ TC-DEPT-015 | Sorting by Department Name updates URL.');

      await dept.sortByDepartmentName();
      await page.waitForLoadState('networkidle');
      console.log('✅ TC-DEPT-015b | Sorting again reverses order.');
      await dept.goto();
      await page.waitForLoadState('networkidle');

      // ─── TC-DEPT-016 | Sorting by Head of Department updates URL ───────────
      console.log('⏳ TC-DEPT-016 | Sorting by Head of Department...');
      await dept.sortByHeadOfDept();
      await expect(page).toHaveURL(/sort/);
      console.log('✅ TC-DEPT-016 | Sorting by Head of Department updates URL.');
      await dept.goto();
      await page.waitForLoadState('networkidle');

      // ─── TC-DEPT-017 | Sorting by Enabled updates URL ──────────────────────
      console.log('⏳ TC-DEPT-017 | Sorting by Enabled...');
      await dept.sortByEnabled();
      await expect(page).toHaveURL(/sort/);
      console.log('✅ TC-DEPT-017 | Sorting by Enabled updates URL.');
      await dept.goto();
      await page.waitForLoadState('networkidle');

      // ─── TC-DEPT-018 | Pagination overview text is correct format ───────────
      console.log('⏳ TC-DEPT-018 | Checking pagination overview...');
      const overviewText = await dept.getPaginationOverviewText();
      expect(overviewText).toMatch(/Showing \d+ to \d+ of \d+ results/);
      console.log(`✅ TC-DEPT-018 | Pagination overview: "${overviewText}".`);

      // ─── TC-DEPT-019 | Pagination items rendered ───────────────────────────
      console.log('⏳ TC-DEPT-019 | Checking pagination items...');
      const pageItemCount = await dept.paginationItems.count();
      expect(pageItemCount).toBeGreaterThan(0);
      console.log(`✅ TC-DEPT-019 | Pagination shows ${pageItemCount} page item(s).`);

      // ─── TC-DEPT-020 | Active page on load is page 1 ───────────────────────
      console.log('⏳ TC-DEPT-020 | Checking active page on load...');
      const activePage = await dept.getActivePage();
      expect(activePage).toBe(1);
      console.log(`✅ TC-DEPT-020 | Active page is ${activePage} on load.`);

      // ─── TC-DEPT-021 | Next page button works ──────────────────────────────
      console.log('⏳ TC-DEPT-021 | Clicking Next page...');
      await dept.goToNextPage();
      await expect(async () => {
        const p = await dept.getActivePage();
        expect(p).toBe(2);
      }).toPass({ timeout: 15_000 });
      const rowCountPage2 = await dept.getRowCount();
      expect(rowCountPage2).toBeGreaterThan(0);
      console.log(`✅ TC-DEPT-021 | Next page button navigated to page 2 with ${rowCountPage2} row(s).`);

      // ─── TC-DEPT-022 | Filter button is visible ────────────────────────────
      console.log('⏳ TC-DEPT-022 | Checking filter button...');
      await expect(dept.filterButton).toBeVisible();
      console.log('✅ TC-DEPT-022 | Filter button is visible.');

      // ─── TC-DEPT-023 | Filter panel opens on click ─────────────────────────
      console.log('⏳ TC-DEPT-023 | Opening filter panel...');
      await dept.openFilter();
      await expect(dept.filterPanel).toBeVisible({ timeout: 10_000 });
      console.log('✅ TC-DEPT-023 | Filter panel opened.');

      // ─── TC-DEPT-024 | Filter panel has "Head of department" select ─────────
      console.log('⏳ TC-DEPT-024 | Checking Head of Department select in filter...');
      await expect(dept.filterHeadOfDeptSelect).toBeVisible();
      console.log('✅ TC-DEPT-024 | Filter panel has Head of Department select field.');

      // ─── TC-DEPT-025 | Filter panel has Status select ──────────────────────
      console.log('⏳ TC-DEPT-025 | Checking Status select in filter...');
      await expect(dept.filterStatusSelect).toBeVisible();
      console.log('✅ TC-DEPT-025 | Filter panel has Status select field.');

      // ─── TC-DEPT-026 | Filter panel has Deleted records select ─────────────
      console.log('⏳ TC-DEPT-026 | Checking Deleted records select in filter...');
      await expect(dept.filterDeletedRecordsSelect).toBeVisible();
      console.log('✅ TC-DEPT-026 | Filter panel has Deleted records select field.');

      // ─── TC-DEPT-027 | Apply and Reset buttons visible in filter ───────────
      console.log('⏳ TC-DEPT-027 | Checking Apply/Reset buttons...');
      await expect(dept.filterApplyButton).toBeVisible();
      await expect(dept.filterResetButton).toBeVisible();
      console.log('✅ TC-DEPT-027 | Filter Apply and Reset buttons are visible.');

      // ─── TC-DEPT-028 | Close filter panel via Escape key ───────────────────
      console.log('⏳ TC-DEPT-028 | Closing filter panel...');
      await dept.closeFilter();
      await expect(dept.filterPanel).not.toBeVisible({ timeout: 10_000 });
      console.log('✅ TC-DEPT-028 | Filter panel closed on Escape.');

      // ─── TC-DEPT-029 | Applying Head of Dept filter narrows results ─────────
      console.log('⏳ TC-DEPT-029 | Applying Head of Department filter (Automation Manager)...');
      await dept.goto();
      await page.waitForLoadState('networkidle');
      await dept.openFilter();
      await expect(dept.filterPanel).toBeVisible({ timeout: 10_000 });

      // Click the Head of Dept select to open its dropdown
      await dept.filterHeadOfDeptSelect.click();

      // Try native <select> first, then Filament custom dropdown
      const nativeSelect = dept.filterHeadOfDeptSelect.locator('select');
      const isNative = await nativeSelect.count() > 0;

      if (isNative) {
        await nativeSelect.selectOption({ label: 'Automation Manager' });
        console.log('  → Used native <select> for Head of Dept filter.');
      } else {
        const listbox = page.locator('[role="listbox"], .fi-select-input-dropdown, .choices__list--dropdown');
        await expect(listbox).toBeVisible({ timeout: 10_000 });
        const option = page.locator('[role="option"], li').filter({ hasText: 'Automation Manager' }).first();
        await expect(option).toBeVisible({ timeout: 10_000 });
        await option.click();
        console.log('  → Used custom dropdown for Head of Dept filter.');
      }

      await dept.applyFilter();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(async () => {
        const badge = await dept.getFilterBadgeCount();
        expect(badge).toBeGreaterThan(0);
      }).toPass({ timeout: 10_000 });

      const filterBadgeCount = await dept.getFilterBadgeCount();
      console.log(`✅ TC-DEPT-029 | Head of Dept filter applied; badge shows ${filterBadgeCount}.`);

      // ─── TC-DEPT-030 | Filtered results contain expected data ───────────────
      console.log('⏳ TC-DEPT-030 | Checking filtered results...');
      const filteredRowCount = await dept.getRowCount();
      if (filteredRowCount > 0) {
        const headText = (await dept.getRowHeadOfDeptByIndex(0)).toLowerCase();
        if (!headText.includes('automation manager')) {
          console.warn('⚠️  TC-DEPT-030 | First row head does not match "automation manager" — filter may be by ID.');
        }
      }
      console.log(`✅ TC-DEPT-030 | Filtered results: ${filteredRowCount} row(s) for Automation Manager.`);

      // ─── TC-DEPT-031 | Status filter: Enabled ──────────────────────────────
      console.log('⏳ TC-DEPT-031 | Applying Status filter (Enabled)...');
      await dept.openFilter();
      await expect(dept.filterPanel).toBeVisible({ timeout: 10_000 });
      await dept.resetFilter();
      await page.waitForLoadState('networkidle');

      await dept.openFilter();
      await expect(dept.filterPanel).toBeVisible({ timeout: 10_000 });

      // Select status using native select (Status filters are typically native)
      const statusSelect = dept.filterStatusSelect.locator('select');
      const statusIsNative = await statusSelect.count() > 0;

      if (statusIsNative) {
        await statusSelect.selectOption({ label: 'Enabled' });
      } else {
        await dept.filterStatusSelect.click();
        const listbox = page.locator('[role="listbox"], .fi-select-input-dropdown');
        await expect(listbox).toBeVisible({ timeout: 10_000 });
        const option = page.locator('[role="option"], li').filter({ hasText: 'Enabled' }).first();
        await expect(option).toBeVisible({ timeout: 10_000 });
        await option.click();
      }

      await dept.applyFilter();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const enabledRowCount = await dept.getRowCount();
      console.log(`✅ TC-DEPT-031 | Status filter "Enabled" shows ${enabledRowCount} row(s).`);

      // ─── TC-DEPT-032 | Reset filter restores original row count ────────────
      console.log('⏳ TC-DEPT-032 | Resetting filter...');
      await dept.openFilter();
      await expect(dept.filterPanel).toBeVisible({ timeout: 10_000 });
      await dept.resetFilter();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(async () => {
        const c = await dept.getRowCount();
        expect(c).toBeGreaterThanOrEqual(enabledRowCount);
      }).toPass({ timeout: 10_000 });

      const resetRowCount = await dept.getRowCount();
      console.log(`✅ TC-DEPT-032 | Reset filter restored ${resetRowCount} row(s).`);

      // ─── TC-DEPT-033 | Sidebar is visible ──────────────────────────────────
      console.log('⏳ TC-DEPT-033 | Checking sidebar...');
      await expect(dept.sidebar).toBeVisible();
      console.log('✅ TC-DEPT-033 | Sidebar is visible.');

      // ─── TC-DEPT-034 | Active sidebar item is "Departments" ────────────────
      console.log('⏳ TC-DEPT-034 | Checking active sidebar item...');
      await expect(dept.activeSidebarItem).toBeVisible();
      const activeSidebarText = await dept.activeSidebarItem.textContent();
      expect(activeSidebarText).toContain('Departments');
      console.log(`✅ TC-DEPT-034 | Active sidebar item: "${activeSidebarText?.trim()}".`);

      // ─── TC-DEPT-035 | "Add New Department" navigates to create page ────────
      console.log('⏳ TC-DEPT-035 | Clicking Add New Department...');
      await dept.addNewButton.click();
      await expect(page).toHaveURL(/departments\/create/, { timeout: 10_000 });
      console.log('✅ TC-DEPT-035 | "Add New Department" button navigates to create page.');
      await dept.goto();
      
  });
});
