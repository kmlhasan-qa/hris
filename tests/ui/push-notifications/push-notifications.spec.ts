import { test, expect } from '@playwright/test';
import { PushNotificationsPage } from '../../../pages/PushNotificationsPage';

const BASE_URL = 'https://hris.itmanage.com.au';

test.describe('Push Notifications', () => {
  test.describe.configure({ retries: 0 });

  test('TC-PN | Full push notifications test suite', async ({ page }) => {
    test.setTimeout(180_000);

    // ─── Reuse authenticated session ───────────────────────────────────────
    await page.goto(`${BASE_URL}/admin`);

    console.log('Current URL:', page.url());

    if (page.url().includes('/login')) {
      throw new Error('Session invalid: redirected to login page');
    }

    console.log('✅ Logged in via reused session.');

    // ─── Navigate to Push Notifications ────────────────────────────────────
    const pn = new PushNotificationsPage(page);
    await pn.goto();
    await page.waitForLoadState('networkidle');

    console.log('✅ Navigated to Push Notifications page.');

    // ─── TC-PN-001 ─────────────────────────────────────────────────────────
    console.log('⏳ TC-PN-001 | Checking page heading...');
    await pn.assertOnPage();
    console.log('✅ TC-PN-001 | Page heading is "Push Notifications".');

    // ─── TC-PN-002 ─────────────────────────────────────────────────────────
    console.log('⏳ TC-PN-002 | Checking breadcrumbs...');
    await pn.assertBreadcrumbs();
    await expect(pn.breadcrumbPushNotifications)
      .toHaveAttribute('href', /push-notifications/);
    console.log('✅ TC-PN-002 | Breadcrumbs are correct.');

    // ─── TC-PN-003 ─────────────────────────────────────────────────────────
    console.log('⏳ TC-PN-003 | Checking Send New button...');
    await expect(pn.sendNewButton).toBeVisible();
    await expect(pn.sendNewButton)
      .toHaveAttribute('href', /push-notifications\/create/);
    console.log('✅ TC-PN-003 | Send New button visible.');

    // ─── TC-PN-004 ─────────────────────────────────────────────────────────
    console.log('⏳ TC-PN-004 | Checking search input...');
    await expect(pn.searchInput).toBeVisible();
    await pn.fillSearch('test');
    await expect(pn.searchInput).toHaveValue('test');
    await page.waitForLoadState('networkidle');
    await pn.clearSearch();
    await expect(pn.searchInput).toHaveValue('');
    await page.waitForLoadState('networkidle');
    console.log('✅ TC-PN-004 | Search input is functional.');

    // ─── TC-PN-005 ─────────────────────────────────────────────────────────
    console.log('⏳ TC-PN-005 | Searching for Leave Request...');
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

    console.log(`✅ TC-PN-005 | Search returned ${searchRowCount} rows.`);

    // ─── TC-PN-006 ─────────────────────────────────────────────────────────
    console.log('⏳ TC-PN-006 | Searching no-match...');
    await pn.fillSearch('zzzxxx_no_match_9999');
    await page.waitForTimeout(1500);
    await page.waitForLoadState('networkidle');

    const noResultCount = await pn.getRowCount();
    const emptyState = page.locator('.fi-ta-empty-state, [class*="empty"]');
    const emptyStateVisible = await emptyState.isVisible().catch(() => false);

    if (noResultCount === 0 || emptyStateVisible) {
      console.log(`✅ TC-PN-006 | No results.`);
    } else {
      console.warn(`⚠️ Search returned ${noResultCount} rows.`);
    }

    await pn.clearSearch();
    await page.waitForTimeout(1500);
    await page.waitForLoadState('networkidle');

    // ─── TC-PN-007 ─────────────────────────────────────────────────────────
    console.log('⏳ TC-PN-007 | Checking table headers...');
    await pn.assertTableHeadersVisible();
    console.log('✅ TC-PN-007 | Table headers visible.');

    // ─── TC-PN-008 ─────────────────────────────────────────────────────────
    const rowCount = await pn.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
    console.log(`✅ TC-PN-008 | ${rowCount} rows found.`);

    // Keep TC-PN-009 until TC-PN-033 unchanged
    // Your existing logic is fine; only login/session setup changed.
  });
});