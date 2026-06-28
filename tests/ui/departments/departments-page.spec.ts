import { test, expect } from '@playwright/test';
import { DepartmentsPage } from '../../../pages/DepartmentsPage';
import { assertLoggedIn, gotoDepartments } from './_helpers';

test.describe('Departments - Page Smoke', () => {
  test('should load departments page correctly', async ({ page }) => {
    await assertLoggedIn(page);

    const dept = new DepartmentsPage(page);
    await gotoDepartments(page);

    await dept.assertOnPage();
    await dept.assertBreadcrumbs();

    await expect(dept.addNewButton).toBeVisible();
    await expect(dept.searchInput).toBeVisible();
    await expect(dept.filterButton).toBeVisible();
  });
});