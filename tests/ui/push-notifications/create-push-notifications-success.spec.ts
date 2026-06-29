import { test, expect } from '../../../src/core/fixtures';

test.describe('Push Notifications - Create Success Flow', () => {
  test('creates a push notification and finds it in the list', async ({
    pushNotifications,
    pushNotificationForm,
  }) => {
    const uniqueTitle = `Automation PN ${Date.now()}`;

    await pushNotificationForm.goto();
    await pushNotificationForm.fillTitle(uniqueTitle);
    await pushNotificationForm.fillBody('This is an automated test notification');
    await pushNotificationForm.toggleSendToAll();
    await pushNotificationForm.submit();

    // Submission redirects back to the list table.
    await expect(pushNotifications.table.rows.first().or(pushNotifications.table.emptyState))
      .toBeVisible({ timeout: 20_000 });

    await pushNotifications.goto();
    await pushNotifications.table.filterBy(uniqueTitle);

    await expect.poll(() => pushNotifications.table.rowCount()).toBeGreaterThan(0);
    expect((await pushNotifications.title(0)).toLowerCase()).toContain(uniqueTitle.toLowerCase());
  });
});
