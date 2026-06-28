import { test, expect } from '@playwright/test';
import { openDashboard } from './_helpers';

test.describe('Dashboard Widgets', () => {
  test('TC-DASH-011 | Total Employees widget visible', async ({ page }) => {
    const d = await openDashboard(page);

    await expect(d.totalEmployeesCard).toBeVisible();

    console.log('✅ TC-DASH-011 passed');
  });

  test('TC-DASH-012 | New Hires widget visible', async ({ page }) => {
    const d = await openDashboard(page);

    await expect(d.newHiresCard).toBeVisible();

    console.log('✅ TC-DASH-012 passed');
  });

  test('TC-DASH-013 | Today Attendance widget visible', async ({ page }) => {
    const d = await openDashboard(page);

    await expect(d.todayAttendanceCard).toBeVisible();

    console.log('✅ TC-DASH-013 passed');
  });

  test('TC-DASH-014 | Latest News widget visible', async ({ page }) => {
    const d = await openDashboard(page);

    await expect(d.latestNewsLink).toBeVisible();

    console.log('✅ TC-DASH-014 passed');
  });
});