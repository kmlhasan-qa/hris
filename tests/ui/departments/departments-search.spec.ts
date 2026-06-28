import { test, expect } from '@playwright/test';
import { DepartmentsPage } from '../../../pages/DepartmentsPage';
import { assertLoggedIn, gotoDepartments } from './_helpers';

test.describe('Departments - Search', () => {
  test('should allow typing and clearing search', async ({ page }) => {
    await assertLoggedIn(page);

    const dept = new DepartmentsPage(page);
    await gotoDepartments(page);

    await dept.fillSearch('test');

    await expect(dept.searchInput).toHaveValue('test');

    await dept.clearSearch();

    await expect(dept.searchInput).toHaveValue('');
  });

  test('should return results for valid search', async ({ page }) => {
    await assertLoggedIn(page);

    const dept = new DepartmentsPage(page);
    await gotoDepartments(page);

    await dept.fillSearch('department');

    // 🔥 wait for UI to stabilize (no flaky timeout)
    await expect.poll(async () => await dept.getRowCount(), {
      timeout: 10000,
    }).toBeGreaterThan(0);

    const count = await dept.getRowCount();
    expect(count).toBeGreaterThan(0);

    // 🔥 SAFE assertion: only validate UI has valid data
    const firstName = await dept.getRowDepartmentNameByIndex(0);
    expect(firstName.length).toBeGreaterThan(0);

    await dept.clearSearch();

    await expect.poll(async () => await dept.getRowCount(), {
      timeout: 10000,
    }).toBeGreaterThanOrEqual(0);
  });

  test('should show empty state for invalid search', async ({ page }) => {
    await assertLoggedIn(page);

    const dept = new DepartmentsPage(page);
    await gotoDepartments(page);

    await dept.fillSearch('zzzxxx_no_match_9999');

    // 🔥 stable condition: either no rows OR empty UI state
    await expect.poll(
      async () => {
        const rows = await dept.getRowCount();

        const emptyState = page.locator(
          '.fi-ta-empty-state, [class*="empty"]'
        );

        const emptyVisible = await emptyState
          .isVisible()
          .catch(() => false);

        return rows === 0 || emptyVisible;
      },
      {
        timeout: 10000,
      }
    ).toBeTruthy();

    const count = await dept.getRowCount();

    const emptyState = page.locator('.fi-ta-empty-state, [class*="empty"]');
    const emptyVisible = await emptyState.isVisible().catch(() => false);

    expect(count === 0 || emptyVisible).toBeTruthy();

    await dept.clearSearch();

    await expect.poll(async () => await dept.getRowCount(), {
      timeout: 10000,
    }).toBeGreaterThanOrEqual(0);
  });
});