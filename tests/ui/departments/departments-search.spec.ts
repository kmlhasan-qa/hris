import { test, expect } from '../../../src/core/fixtures';

test.describe('Departments - Search', () => {
  test.beforeEach(async ({ departments }) => {
    await departments.goto();
  });

  test('allows typing and clearing the search field', async ({ departments }) => {
    await departments.table.filterBy('test');
    await expect(departments.table.search).toHaveValue('test');

    await departments.table.clearSearch();
    await expect(departments.table.search).toHaveValue('');
  });

  test('returns results for a valid query', async ({ departments }) => {
    await departments.table.filterBy('department');

    await expect.poll(() => departments.table.rowCount()).toBeGreaterThan(0);
    expect((await departments.departmentName(0)).length).toBeGreaterThan(0);

    await departments.table.clearSearch();
  });

  test('shows an empty state for a non-matching query', async ({ departments }) => {
    await departments.table.filterBy('zzzxxx_no_match_9999');

    await expect.poll(() => departments.table.hasNoResults()).toBe(true);

    await departments.table.clearSearch();
  });
});
