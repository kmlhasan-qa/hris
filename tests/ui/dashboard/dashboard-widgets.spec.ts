import { test, expect } from '../../../src/core/fixtures';

test.describe('Dashboard Widgets', () => {
  test.beforeEach(async ({ dashboard }) => {
    await dashboard.goto();
  });

  test('TC-DASH-011 | Total Employees widget visible', async ({ dashboard }) => {
    await expect(dashboard.totalEmployeesCard).toBeVisible();
  });

  test('TC-DASH-012 | New Hires widget visible', async ({ dashboard }) => {
    await expect(dashboard.newHiresCard).toBeVisible();
  });

  test('TC-DASH-013 | Today Attendance widget visible', async ({ dashboard }) => {
    await expect(dashboard.todayAttendanceCard).toBeVisible();
  });

  test('TC-DASH-014 | Latest News widget visible', async ({ dashboard }) => {
    await expect(dashboard.latestNewsLink).toBeVisible();
  });
});
