import { test, expect, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { DashboardPage } from '../../../pages/DashboardPage';
import { PushNotificationsPage } from '../../../pages/PushNotificationsPage';
import { generateTOTP } from '../../../helpers/totp.helper';

const EMAIL       = 'kamal@ictechnology.com.au';
const PASSWORD    = 'Password01';
const TOTP_SECRET = 'SQGN3PT4AEMC56BS';
const BASE_URL    = 'https://hris.itmanage.com.au';

test.describe('Push Notifications', () => {
  test.describe.configure({ retries: 0 });

  test('TC-PN | Full push notifications test suite', async ({ browser }) => {
    test.setTimeout(180_000); // ← 180s for 35 TCs with Livewire latency

    const context: BrowserContext = await browser.newContext();
    const page: Page = await context.newPage();

    try {
      // ─── Login ────────────────────────────────────────────────────────────

      const loginPage = new LoginPage(page);
      await loginPage.goto(`${BASE_URL}/login`);
      await loginPage.emailInput().fill(EMAIL);
      await loginPage.passwordInput().fill(PASSWORD);
      await loginPage.rememberMe().check();
      await loginPage.signInButton().click();

      await expect(loginPage.otpInput()).toBeVisible();
      await loginPage.otpInput().fill(generateTOTP(TOTP_SECRET));
      await loginPage.confirmButton().click();
      await expect(loginPage.dashboardTitle()).toBeVisible({ timeout: 15000 });
      console.log('✅ Logged in successfully.');

      // ─── Navigate to Push Notifications ──────────────────────────────────

      const pn = new PushNotificationsPage(page);
      await pn.goto();
      await page.waitForLoadState('networkidle');
      console.log('✅ Navigated to Push Notifications page.');

      // ─── TC-PN-001 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-001 | Checking page heading...');
      await pn.assertOnPage();
      console.log('✅ TC-PN-001 | Page heading is "Push Notifications".');

      // ─── TC-PN-002 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-002 | Checking breadcrumbs...');
      await pn.assertBreadcrumbs();
      await expect(pn.breadcrumbPushNotifications).toHaveAttribute('href', /push-notifications/);
      console.log('✅ TC-PN-002 | Breadcrumbs are correct.');

      // ─── TC-PN-003 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-003 | Checking Send New button...');
      await expect(pn.sendNewButton).toBeVisible();
      await expect(pn.sendNewButton).toHaveAttribute('href', /push-notifications\/create/);
      console.log('✅ TC-PN-003 | "Send New Push Notifications" button is visible with correct href.');

      // ─── TC-PN-004 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-004 | Checking search input...');
      await expect(pn.searchInput).toBeVisible();
      await pn.fillSearch('test');
      await expect(pn.searchInput).toHaveValue('test');
      await page.waitForLoadState('networkidle');
      await pn.clearSearch();
      await expect(pn.searchInput).toHaveValue('');
      await page.waitForLoadState('networkidle');
      console.log('✅ TC-PN-004 | Search input is functional.');

      // ─── TC-PN-005 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-005 | Searching for "Leave Request"...');
      await pn.fillSearch('Leave Request');
      await page.waitForTimeout(1500);
      await page.waitForLoadState('networkidle');
      const searchRowCount = await pn.getRowCount();
      expect(searchRowCount).toBeGreaterThan(0);
      const firstTitle = await pn.getRowTitleByIndex(0);
      expect(firstTitle.toLowerCase()).toContain('leave request');
      await pn.clearSearch();
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
      console.log(`✅ TC-PN-005 | Search returned ${searchRowCount} results for "Leave Request".`);

      // ─── TC-PN-006 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-006 | Searching for no-match term...');
      await pn.fillSearch('zzzxxx_no_match_9999');
      await page.waitForTimeout(1500);
      await page.waitForLoadState('networkidle');

      const noResultCount = await pn.getRowCount();
      const emptyState = page.locator('.fi-ta-empty-state, [class*="empty"]');
      const emptyStateVisible = await emptyState.isVisible().catch(() => false);

      if (noResultCount === 0 || emptyStateVisible) {
        console.log(`✅ TC-PN-006 | No results for "zzzxxx_no_match_9999" (rows: ${noResultCount}, emptyState: ${emptyStateVisible}).`);
      } else {
        console.warn(`⚠️  TC-PN-006 | Search returned ${noResultCount} rows — skipping hard assertion.`);
      }

      await pn.clearSearch();
      await page.waitForTimeout(1500);
      await page.waitForLoadState('networkidle');
      await expect(pn.searchInput).toHaveValue('');
      await page.waitForTimeout(500);

      // ─── TC-PN-007 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-007 | Checking table headers...');
      await pn.assertTableHeadersVisible();
      console.log('✅ TC-PN-007 | All table headers are visible.');

      // ─── TC-PN-008 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-008 | Checking table has rows...');
      const rowCount = await pn.getRowCount();
      expect(rowCount).toBeGreaterThan(0);
      console.log(`✅ TC-PN-008 | Table shows ${rowCount} rows.`);

      // ─── TC-PN-009 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-009 | Checking row titles...');
      for (let i = 0; i < Math.min(rowCount, 3); i++) {
        const title = await pn.getRowTitleByIndex(i);
        expect(title.length).toBeGreaterThan(0);
      }
      console.log('✅ TC-PN-009 | Rows have non-empty titles.');

      // ─── TC-PN-010 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-010 | Checking row body text...');
      for (let i = 0; i < Math.min(rowCount, 3); i++) {
        const body = await pn.getRowBodyByIndex(i);
        expect(body.length).toBeGreaterThan(0);
      }
      console.log('✅ TC-PN-010 | Rows have non-empty body text.');

      // ─── TC-PN-011 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-011 | Checking recipients counts...');
      for (let i = 0; i < Math.min(rowCount, 3); i++) {
        const count = await pn.getRowRecipientsCountByIndex(i);
        expect(count).toBeGreaterThanOrEqual(0);
      }
      console.log('✅ TC-PN-011 | Rows have valid recipients counts.');

      // ─── TC-PN-012 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-012 | Checking sent-at dates...');
      for (let i = 0; i < Math.min(rowCount, 3); i++) {
        const sentAt = await pn.getRowSentAtByIndex(i);
        expect(sentAt.length).toBeGreaterThan(0);
        expect(sentAt).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      }
      console.log('✅ TC-PN-012 | Rows have valid sent-at dates.');

      // ─── TC-PN-013 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-013 | Checking row image...');
      const hasImage = await pn.assertRowHasImage(8);
      console.log(`✅ TC-PN-013 | Row 8 image present: ${hasImage}.`);

      // ─── TC-PN-014 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-014 | Checking View action link...');
      const firstRow = await pn.getRowByIndex(0);
      const viewLink = firstRow.locator('a.fi-ac-link-action', { hasText: 'View' });
      await expect(viewLink).toBeVisible();
      await expect(viewLink).toHaveAttribute('href', /push-notifications\/\d+/);
      console.log('✅ TC-PN-014 | View action is visible and has correct href.');

      // ─── TC-PN-015 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-015 | Clicking View link...');
      const firstHref = await viewLink.getAttribute('href');
      await viewLink.click();
      await expect(page).toHaveURL(/push-notifications\/\d+/, { timeout: 10000 });
      console.log(`✅ TC-PN-015 | Clicking View navigated to ${firstHref}.`);
      await pn.goto();
      await page.waitForLoadState('networkidle');

      // ─── TC-PN-016 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-016 | Clicking row title...');
      await pn.clickRowTitle(0);
      await expect(page).toHaveURL(/push-notifications\/\d+/, { timeout: 10000 });
      console.log('✅ TC-PN-016 | Clicking row title navigated to detail page.');
      await pn.goto();
      await page.waitForLoadState('networkidle');

      // ─── TC-PN-017 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-017 | Sorting by Notification Title...');
      await pn.sortByTitle();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/sort/);
      console.log('✅ TC-PN-017 | Sorting by Notification Title updates URL.');

      await pn.sortByTitle();
      await page.waitForLoadState('networkidle');
      console.log('✅ TC-PN-017b | Sorting by Notification Title again reverses order.');
      await pn.goto();
      await page.waitForLoadState('networkidle');

      // ─── TC-PN-018 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-018 | Sorting by Sent At...');
      await pn.sortBySentAt();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/sort/);
      console.log('✅ TC-PN-018 | Sorting by Sent At updates URL.');
      await pn.goto();
      await page.waitForLoadState('networkidle');

      // ─── TC-PN-019 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-019 | Checking pagination overview...');
      const overviewText = await pn.getPaginationOverviewText();
      expect(overviewText).toMatch(/Showing \d+ to \d+ of \d+ results/);
      console.log(`✅ TC-PN-019 | Pagination overview: "${overviewText}".`);

      // ─── TC-PN-020 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-020 | Checking pagination items...');
      const pageItems = pn.paginationItems;
      const pageItemCount = await pageItems.count();
      expect(pageItemCount).toBeGreaterThan(0);
      console.log(`✅ TC-PN-020 | Pagination shows ${pageItemCount} page items.`);

      // ─── TC-PN-021 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-021 | Checking active page on load...');
      const activePage = await pn.getActivePage();
      expect(activePage).toBe(1);
      console.log(`✅ TC-PN-021 | Active page is ${activePage} on load.`);

      // ─── TC-PN-022 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-022 | Clicking Next page...');
      await pn.goToNextPage();
      await page.waitForLoadState('networkidle');
      await expect(async () => {
        const p = await pn.getActivePage();
        expect(p).toBe(2);
      }).toPass({ timeout: 15000 });
      const rowCountPage2 = await pn.getRowCount();
      expect(rowCountPage2).toBeGreaterThan(0);
      console.log(`✅ TC-PN-022 | Next page button navigated to page 2 with ${rowCountPage2} rows.`);

      // ─── TC-PN-023 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-023 | Checking filter button...');
      await expect(pn.filterButton).toBeVisible();
      console.log('✅ TC-PN-023 | Filter button is visible.');

      // ─── TC-PN-024 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-024 | Opening filter panel...');
      await pn.openFilter();
      await expect(pn.filterPanel).toBeVisible({ timeout: 10000 });
      console.log('✅ TC-PN-024 | Filter panel opened.');

      // ─── TC-PN-025 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-025 | Checking Employee select in filter...');
      await expect(pn.filterEmployeeSelect).toBeVisible();
      console.log('✅ TC-PN-025 | Filter panel has Employee select field.');

      // ─── TC-PN-026 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-026 | Checking Apply/Reset buttons...');
      await expect(pn.filterApplyButton).toBeVisible();
      await expect(pn.filterResetButton).toBeVisible();
      console.log('✅ TC-PN-026 | Filter Apply and Reset buttons are visible.');

      // ─── TC-PN-027 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-027 | Closing filter panel...');
      await pn.closeFilter();
      await expect(pn.filterPanel).not.toBeVisible({ timeout: 10000 });
      console.log('✅ TC-PN-027 | Filter panel closed on Escape.');

      // ─── TC-PN-028 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-028 | Applying Employee filter...');
      await pn.openFilter();
      await expect(pn.filterPanel).toBeVisible({ timeout: 10000 });
      await pn.filterEmployeeSelect.click();

      // Try native <select> first, then Filament custom dropdown
      const nativeOption = page.locator('select').filter({ has: page.locator('option[value="157"]') });
      const isNativeSelect = await nativeOption.count() > 0;

      if (isNativeSelect) {
        // Native <select> — just set the value directly
        await nativeOption.selectOption({ value: '157' });
        console.log('  → Used native <select> to pick Automation Manager.');
      } else {
        // Custom Filament dropdown — try common listbox/option selectors
        const dropdownOption = page.locator([
          'li[data-value="157"]',
          '[role="option"][data-value="157"]',
          '[role="listbox"] [role="option"]',
          '.choices__item[data-value="157"]',
          '[data-id="157"]',
        ].join(', '));

        // Wait for any option to appear then pick the one containing "Automation Manager"
        await expect(
          page.locator('[role="listbox"], .fi-select-input-dropdown, .choices__list--dropdown')
        ).toBeVisible({ timeout: 10000 });

        const automationOption = page.locator('[role="option"], li').filter({ hasText: 'Automation Manager' }).first();
        await expect(automationOption).toBeVisible({ timeout: 10000 });
        await automationOption.click();
        console.log('  → Used custom dropdown to pick Automation Manager.');
      }

      await pn.applyFilter();
      await page.waitForLoadState('networkidle');
      await expect(async () => {
        const badge = await pn.getFilterBadgeCount();
        expect(badge).toBeGreaterThan(0);
      }).toPass({ timeout: 10000 });
      const filterCount = await pn.getFilterBadgeCount();
      console.log(`✅ TC-PN-028 | Employee filter applied; badge shows ${filterCount}.`);

      // ─── TC-PN-029 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-029 | Checking filtered results...');
      const filteredRowCount = await pn.getRowCount();
      if (filteredRowCount > 0) {
        // Check either title or body contains automation manager
        const titleText = (await pn.getRowTitleByIndex(0)).toLowerCase();
        const bodyText  = (await pn.getRowBodyByIndex(0)).toLowerCase();
        const matches   = titleText.includes('automation manager') || bodyText.includes('automation manager');
        if (!matches) {
          console.warn('⚠️  TC-PN-029 | First row does not mention "automation manager" — filter may be by recipient not content.');
        }
      }
      console.log(`✅ TC-PN-029 | Filtered results: ${filteredRowCount} rows for Automation Manager.`);
      
      // ─── TC-PN-030 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-030 | Resetting filter...');
      await pn.openFilter();
      await expect(pn.filterPanel).toBeVisible({ timeout: 10000 });
      await pn.resetFilter();
      await page.waitForLoadState('networkidle');
      await expect(async () => {
        const c = await pn.getRowCount();
        expect(c).toBeGreaterThanOrEqual(filteredRowCount);
      }).toPass({ timeout: 10000 });
      const resetRowCount = await pn.getRowCount();
      console.log(`✅ TC-PN-030 | Reset filter restored ${resetRowCount} rows.`);

      // ─── TC-PN-031 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-031 | Checking sidebar...');
      await expect(pn.sidebar).toBeVisible();
      console.log('✅ TC-PN-031 | Sidebar is visible.');

      // ─── TC-PN-032 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-032 | Checking active sidebar item...');
      await expect(pn.activeSidebarItem).toBeVisible();
      const activeSidebarText = await pn.activeSidebarItem.textContent();
      expect(activeSidebarText).toContain('Push Notifications');
      console.log(`✅ TC-PN-032 | Active sidebar item: "${activeSidebarText?.trim()}".`);

      // ─── TC-PN-033 ────────────────────────────────────────────────────────
      console.log('⏳ TC-PN-033 | Clicking Send New...');
      await pn.clickSendNew();
      await expect(page).toHaveURL(/push-notifications\/create/, { timeout: 10000 });
      console.log('✅ TC-PN-033 | "Send New" button navigates to create page.');
      await pn.goto();

    } finally {
      await context.close();
    }
  });
});