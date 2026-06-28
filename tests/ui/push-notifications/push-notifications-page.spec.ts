import { test, expect } from '@playwright/test';
import { PushNotificationsPage } from '../../../pages/PushNotificationsPage';
import {
  assertLoggedIn,
  gotoPushNotificationsList,
} from './_helpers';

test.describe('Push Notifications - Page', () => {
  test('should load page correctly', async ({ page }) => {
    await assertLoggedIn(page);

    const pn = new PushNotificationsPage(page);
    await gotoPushNotificationsList(page);

    await pn.assertOnPage();
    await pn.assertBreadcrumbs();

    await expect(pn.sendNewButton).toBeVisible();
    await expect(pn.searchInput).toBeVisible();
  });
});