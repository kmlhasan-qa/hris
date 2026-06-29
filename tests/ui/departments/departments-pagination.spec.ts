import { test, expect } from '../../../src/core/fixtures';

test.describe('Departments - Table', () => {
  test.beforeEach(async ({ departments }) => {
    await departments.goto();
  });

  test('renders the table with at least one row', async ({ departments }) => {
    expect(await departments.table.rowCount()).toBeGreaterThan(0);
  });

  test('shows non-empty department names', async ({ departments }) => {
    const rowCount = await departments.table.rowCount();

    for (let i = 0; i < Math.min(rowCount, 3); i++) {
      expect((await departments.departmentName(i)).length).toBeGreaterThan(0);
    }
  });

  test('shows the enabled status icon', async ({ departments }) => {
    await expect(departments.enabledIcon(0)).toBeVisible();
  });
});
