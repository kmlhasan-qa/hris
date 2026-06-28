import { test, expect } from '@playwright/test';
import { PushNotificationsPage } from '../../../pages/PushNotificationsPage';
import {
  assertLoggedIn,
  gotoPushNotificationsList,
} from './_helpers';

test.describe('Push Notifications - Table', () => {
  test('should render table with data', async ({ page }) => {
    await assertLoggedIn(page);

    const pn = new PushNotificationsPage(page);
    await gotoPushNotificationsList(page);

    const count = await pn.getRowCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should have valid titles in rows', async ({ page }) => {
    await assertLoggedIn(page);

    const pn = new PushNotificationsPage(page);
    await gotoPushNotificationsList(page);

    const count = await pn.getRowCount();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const title = await pn.getRowTitleByIndex(i);
      expect(title.length).toBeGreaterThan(0);
    }
  });
});