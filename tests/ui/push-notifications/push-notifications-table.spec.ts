import { test, expect } from '../../../src/core/fixtures';

test.describe('Push Notifications - Table', () => {
  test.beforeEach(async ({ pushNotifications }) => {
    await pushNotifications.goto();
  });

  test('renders the table with at least one row', async ({ pushNotifications }) => {
    expect(await pushNotifications.table.rowCount()).toBeGreaterThan(0);
  });

  test('shows valid titles in rows', async ({ pushNotifications }) => {
    const count = await pushNotifications.table.rowCount();

    for (let i = 0; i < Math.min(count, 3); i++) {
      expect((await pushNotifications.title(i)).length).toBeGreaterThan(0);
    }
  });
});
