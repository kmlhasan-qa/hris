import { test, expect } from '@playwright/test';
import { openDashboard } from './_helpers';

test.describe('Dashboard Overview', () => {
  test('TC-DASH-001 | Dashboard page loaded successfully', async ({ page }) => {
    const d = await openDashboard(page);

    await d.assertOnDashboard();

    console.log('✅ TC-DASH-001 passed');
  });

  test('TC-DASH-003 | Search input is functional', async ({ page }) => {
    const d = await openDashboard(page);

    await expect(d.searchInput).toBeVisible();

    await d.fillSearch('test');
    await expect(d.searchInput).toHaveValue('test');

    await d.clearSearch();
    await expect(d.searchInput).toHaveValue('');

    console.log('✅ TC-DASH-003 passed');
  });

  test('TC-DASH-SIDEBAR | Sidebar visible', async ({ page }) => {
    const d = await openDashboard(page);

    await expect(d.sidebar).toBeVisible();

    console.log('✅ Sidebar visible');
  });
});