import { test, expect } from '../../../src/core/fixtures';
import { expectOnDashboard } from '../../../src/assertions/dashboard.assertions';

test.describe('Dashboard Overview', () => {
  test.beforeEach(async ({ dashboard }) => {
    await dashboard.goto();
  });

  test('TC-DASH-001 | Dashboard page loaded successfully', async ({ dashboard }) => {
    await expectOnDashboard(dashboard);
  });

  test('TC-DASH-003 | Search input is functional', async ({ dashboard }) => {
    await expect(dashboard.searchInput).toBeVisible();

    await dashboard.fillSearch('test');
    await expect(dashboard.searchInput).toHaveValue('test');

    await dashboard.clearSearch();
    await expect(dashboard.searchInput).toHaveValue('');
  });

  test('TC-DASH-SIDEBAR | Sidebar visible', async ({ dashboard }) => {
    await expect(dashboard.sidebar.root).toBeVisible();
  });
});
