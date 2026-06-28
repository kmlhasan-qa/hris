import { test, expect } from '@playwright/test';
import { DepartmentsPage } from '../../../pages/DepartmentsPage';
import { assertLoggedIn, gotoDepartments } from './_helpers';

test.describe('Departments - Table', () => {
  test('should render table with valid data', async ({ page }) => {
    await assertLoggedIn(page);

    const dept = new DepartmentsPage(page);
    await gotoDepartments(page);

    const rowCount = await dept.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should have non-empty department names', async ({ page }) => {
    await assertLoggedIn(page);

    const dept = new DepartmentsPage(page);
    await gotoDepartments(page);

    const rowCount = await dept.getRowCount();

    for (let i = 0; i < Math.min(rowCount, 3); i++) {
      const name = await dept.getRowDepartmentNameByIndex(i);
      expect(name.length).toBeGreaterThan(0);
    }
  });

  test('should show enabled status icons', async ({ page }) => {
    await assertLoggedIn(page);

    const dept = new DepartmentsPage(page);
    await gotoDepartments(page);

    const row = await dept.getRowByIndex(0);
    await expect(row.locator('td.fi-ta-cell-is-enabled svg')).toBeVisible();
  });
});