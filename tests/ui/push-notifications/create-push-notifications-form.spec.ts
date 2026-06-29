import { test, expect } from '../../../src/core/fixtures';

test.describe('Push Notifications - Create Form', () => {
  test.beforeEach(async ({ pushNotificationForm }) => {
    await pushNotificationForm.goto();
  });

  test('fills title and body', async ({ pushNotificationForm }) => {
    await pushNotificationForm.fillTitle('Test Notification');
    await expect(pushNotificationForm.titleInput).toHaveValue('Test Notification');

    await pushNotificationForm.fillBody('This is a test message');
    await expect(pushNotificationForm.bodyTextarea).toHaveValue('This is a test message');
  });

  test('toggles send-to-all', async ({ pushNotificationForm }) => {
    await pushNotificationForm.toggleSendToAll();
    await expect(pushNotificationForm.sendToAllToggle).toHaveAttribute('aria-checked', 'true');
  });
});
