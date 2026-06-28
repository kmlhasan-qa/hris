import { test, expect } from '@playwright/test';
import { PushNotificationsPage } from '../../../pages/PushNotificationsPage';
import {
  assertLoggedIn,
  gotoPushNotificationsList,
} from './_helpers';

test.describe('Push Notifications - Navigation', () => {
  test('should navigate via Send New button', async ({ page }) => {
    await assertLoggedIn(page);

    const pn = new PushNotificationsPage(page);
    await gotoPushNotificationsList(page);

    const href = await pn.sendNewButton.getAttribute('href');

    await pn.sendNewButton.click();

    await expect(page).toHaveURL(/push-notifications\/create/);

    console.log('Navigated to:', href);
  });
});