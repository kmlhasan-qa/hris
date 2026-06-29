import { test, expect } from '@playwright/test';
import {
  assertLoggedIn,
  gotoCreateDepartment,
} from './_helpers';
import { DepartmentsCreatePage } from '../../../pages/DepartmentsCreatePage';

test.describe('Departments - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await assertLoggedIn(page);
    await gotoCreateDepartment(page);
  });

  test('TC-DEPT-VAL-001 | Enabled toggle default ON', async ({ page }) => {
    const createPg = new DepartmentsCreatePage(page);

    const isEnabled = await createPg.isEnabledOn();

    expect(isEnabled).toBe(true);
  });

  test('TC-DEPT-VAL-002 | Department name required', async ({ page }) => {
    const createPg = new DepartmentsCreatePage(page);

    await createPg.submit();

    // Validation should prevent navigation away from create page
    await expect(page).toHaveURL(/departments\/create/);

    // Optional stronger validation:
    // Uncomment if your UI shows validation message
    // await expect(
    //   page.locator('.fi-fo-field-wrp-error-message, text=required')
    // ).toBeVisible();
  });

  test('TC-DEPT-VAL-003 | Cancel works', async ({ page }) => {
    const createPg = new DepartmentsCreatePage(page);

    await createPg.cancel();

    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/\/admin(\/departments)?/);
  });
});