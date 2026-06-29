import { test, expect } from '../../../src/core/fixtures';

test.describe('Departments - Validation', () => {
  test.beforeEach(async ({ departmentForm }) => {
    await departmentForm.gotoCreate();
  });

  test('TC-DEPT-VAL-001 | Enabled toggle defaults to ON', async ({ departmentForm }) => {
    expect(await departmentForm.isEnabledOn()).toBe(true);
  });

  test('TC-DEPT-VAL-002 | Department name is required', async ({ departmentForm }) => {
    await departmentForm.submit();
    // Validation blocks navigation away from the create page.
    await expect(departmentForm.page).toHaveURL(/departments\/create/);
  });

  test('TC-DEPT-VAL-003 | Cancel returns to the list', async ({ departmentForm }) => {
    await departmentForm.cancel();
    await expect(departmentForm.page).toHaveURL(/\/admin(\/departments)?/);
  });
});
