import { test, expect } from '../../../src/core/fixtures';

test.describe('Departments - Create & Delete', () => {
  test('TC-DEPT-CREATE-DELETE | creates then deletes a department', async ({
    departments,
    departmentForm,
  }) => {
    const departmentName = `QA Dept ${Date.now()}`;

    // Create
    await departmentForm.gotoCreate();
    await departmentForm.fillName(departmentName);
    await departmentForm.selectHeadOfDept('Manager Multi Department');
    await departmentForm.submit();

    // Successful create redirects to the edit page.
    await expect(departmentForm.page).toHaveURL(/\/departments\/\d+\/edit/);
    await expect(departmentForm.nameInput).toHaveValue(departmentName);

    const departmentId = departmentForm.page.url().match(/departments\/(\d+)/)?.[1];
    expect(departmentId, 'department id should be in the edit URL').toBeTruthy();

    // Verify it appears in the list
    await departments.goto();
    await departments.table.filterBy(departmentName);
    await expect(departments.page.locator('table')).toContainText(departmentName);

    // Delete from the edit page
    await departmentForm.gotoEdit(departmentId!);
    await departmentForm.deleteDepartment();

    // Verify it is gone
    await departments.goto();
    await departments.table.filterBy(departmentName);
    await expect(departments.page.locator('table')).not.toContainText(departmentName);
  });
});
