import { test, expect } from '@playwright/test';
import { DepartmentsPage } from '../../../pages/DepartmentsPage';
import { DepartmentsCreatePage } from '../../../pages/DepartmentsCreatePage';
import {
  assertLoggedIn,
  gotoDepartments,
  gotoCreateDepartment,
} from './_helpers';

test.describe('Departments - Create & Delete', () => {
  test('TC-DEPT-CREATE-DELETE | Create then delete department successfully', async ({
    page,
  }) => {
    await assertLoggedIn(page);

    const deptPage = new DepartmentsPage(page);
    const createPage = new DepartmentsCreatePage(page);

    const departmentName = `QA Dept ${Date.now()}`;

    // Create
    await gotoCreateDepartment(page);

    await createPage.fillDepartmentName(departmentName);
    await createPage.selectHeadOfDept('Manager Multi Department');

    await createPage.submit();

    await expect(page).toHaveURL(/\/departments\/\d+\/edit/, {
      timeout: 30000,
    });

    await expect(createPage.departmentNameInput).toHaveValue(departmentName);

    // Capture ID BEFORE leaving edit page
    const currentUrl = page.url();
    const match = currentUrl.match(/departments\/(\d+)/);

    if (!match) {
      throw new Error('Department ID not found');
    }

    const departmentId = match[1];

    // Verify created
    await gotoDepartments(page);

    console.log('After gotoDepartments:', page.url());

    await deptPage.fillSearch(departmentName);

    await expect(page.locator('table')).toContainText(departmentName);

    // Go back to edit page
    await createPage.gotoEdit(departmentId);

    await expect(createPage.pageHeading).toBeVisible();

    // Delete
    await createPage.deleteDepartment();

    // Already redirected by deleteDepartment()
    await page.waitForLoadState('networkidle');

    // Verify deleted
    await deptPage.fillSearch(departmentName);

    await expect(page.locator('table')).not.toContainText(departmentName);
  });
});