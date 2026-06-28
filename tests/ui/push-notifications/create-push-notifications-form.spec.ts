import { test, expect } from '@playwright/test';
import { assertLoggedIn, gotoCreatePushNotification } from './_helpers';
import { PushNotificationsCreatePage } from '../../../pages/PushNotificationsCreatePage';

test.describe('Push Notifications - Create Form', () => {
  test('should fill title and body', async ({ page }) => {
    await assertLoggedIn(page);

    const pn = new PushNotificationsCreatePage(page);
    await gotoCreatePushNotification(page);

    await pn.fillTitle('Test Notification');
    await expect(pn.titleInput).toHaveValue('Test Notification');

    await pn.fillBody('This is a test message');
    await expect(pn.bodyTextarea).toHaveValue('This is a test message');
  });

  test('should toggle send to all users', async ({ page }) => {
    await assertLoggedIn(page);

    const pn = new PushNotificationsCreatePage(page);
    await gotoCreatePushNotification(page);

    await pn.toggleSendToAll();
  });
});