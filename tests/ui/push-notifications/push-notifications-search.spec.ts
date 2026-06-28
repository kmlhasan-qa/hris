import { test, expect } from '@playwright/test';
import { PushNotificationsPage } from '../../../pages/PushNotificationsPage';
import {
  assertLoggedIn,
  gotoPushNotificationsList,
} from './_helpers';

test.describe('Push Notifications - Search', () => {
  test('should allow typing and clearing search', async ({ page }) => {
    await assertLoggedIn(page);

    const pn = new PushNotificationsPage(page);
    await gotoPushNotificationsList(page);

    await pn.fillSearch('test');
    await expect(pn.searchInput).toHaveValue('test');

    await pn.clearSearch();
    await expect(pn.searchInput).toHaveValue('');
  });

  test('should return results for valid search', async ({ page }) => {
    await assertLoggedIn(page);

    const pn = new PushNotificationsPage(page);
    await gotoPushNotificationsList(page);

    await pn.fillSearch('test');

    await expect.poll(async () => pn.getRowCount(), {
      timeout: 10000,
    }).toBeGreaterThan(0);

    const firstTitle = await pn.getRowTitleByIndex(0);
    expect(firstTitle.length).toBeGreaterThan(0);

    await pn.clearSearch();
  });

  test('should show empty state for invalid search', async ({ page }) => {
    await assertLoggedIn(page);

    const pn = new PushNotificationsPage(page);
    await gotoPushNotificationsList(page);

    await pn.fillSearch('zzzxxx_no_match_9999');

    const emptyState = page.locator(
      '.fi-ta-empty-state, [class*="empty"], [role="status"]'
    );

    await expect.poll(async () => {
      const rows = await pn.getRowCount();
      const emptyVisible = await emptyState.isVisible().catch(() => false);

      return rows === 0 || emptyVisible;
    }, {
      timeout: 10000,
    }).toBeTruthy();
  });
});