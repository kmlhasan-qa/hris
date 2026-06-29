import { test, expect } from '../../../src/core/fixtures';

test.describe('Push Notifications - Search', () => {
  test.beforeEach(async ({ pushNotifications }) => {
    await pushNotifications.goto();
  });

  test('allows typing and clearing the search field', async ({ pushNotifications }) => {
    await pushNotifications.table.filterBy('test');
    await expect(pushNotifications.table.search).toHaveValue('test');

    await pushNotifications.table.clearSearch();
    await expect(pushNotifications.table.search).toHaveValue('');
  });

  test('returns results for a valid query', async ({ pushNotifications }) => {
    await pushNotifications.table.filterBy('test');

    await expect.poll(() => pushNotifications.table.rowCount()).toBeGreaterThan(0);
    expect((await pushNotifications.title(0)).length).toBeGreaterThan(0);

    await pushNotifications.table.clearSearch();
  });

  test('shows an empty state for a non-matching query', async ({ pushNotifications }) => {
    await pushNotifications.table.filterBy('zzzxxx_no_match_9999');
    await expect.poll(() => pushNotifications.table.hasNoResults()).toBe(true);
  });
});
