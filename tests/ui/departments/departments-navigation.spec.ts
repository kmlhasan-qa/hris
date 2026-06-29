import { test, expect } from '../../../src/core/fixtures';

test.describe('Departments - Filters', () => {
  test.beforeEach(async ({ departments }) => {
    await departments.goto();
  });

  test('opens and closes the filter panel', async ({ departments }) => {
    await departments.filters.open();
    await expect(departments.filters.panel).toBeVisible();

    await departments.filters.close();
    await expect(departments.filters.panel).not.toBeVisible();
  });

  test('shows the filter controls', async ({ departments }) => {
    await departments.filters.open();

    await expect(departments.filterHeadOfDeptSelect).toBeVisible();
    await expect(departments.filterStatusSelect).toBeVisible();
    await expect(departments.filters.applyButton).toBeVisible();
    await expect(departments.filters.resetButton).toBeVisible();
  });
});
