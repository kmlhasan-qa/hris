import { test, expect } from '@playwright/test';
import { DepartmentsPage } from '../../../pages/DepartmentsPage';
import { assertLoggedIn, gotoDepartments } from './_helpers';

test.describe('Departments - Filters', () => {
  test('should open and close filter panel', async ({ page }) => {
    await assertLoggedIn(page);

    const dept = new DepartmentsPage(page);
    await gotoDepartments(page);

    await dept.openFilter();
    await expect(dept.filterPanel).toBeVisible();

    await dept.closeFilter();
    await expect(dept.filterPanel).not.toBeVisible();
  });

  test('should show filter controls', async ({ page }) => {
    await assertLoggedIn(page);

    const dept = new DepartmentsPage(page);
    await gotoDepartments(page);

    await dept.openFilter();

    await expect(dept.filterHeadOfDeptSelect).toBeVisible();
    await expect(dept.filterStatusSelect).toBeVisible();
    await expect(dept.filterApplyButton).toBeVisible();
    await expect(dept.filterResetButton).toBeVisible();
  });
});