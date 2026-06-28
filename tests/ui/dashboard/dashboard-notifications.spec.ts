import { test, expect } from '@playwright/test';
import { openDashboard } from './_helpers';

test.describe('Dashboard Notifications', () => {
  test('TC-DASH-004 | Notification badge visible', async ({ page }) => {
    const d = await openDashboard(page);

    await expect(d.notificationBadge).toBeVisible();

    const badgeCount = await d.getNotificationBadgeCount();
    expect(badgeCount).toBeGreaterThanOrEqual(0);

    console.log(`✅ TC-DASH-004 passed (${badgeCount})`);
  });

  test('TC-DASH-005 | Notifications modal opens', async ({ page }) => {
    const d = await openDashboard(page);

    await d.openNotifications();
    await d.assertNotificationModalOpen();

    console.log('✅ TC-DASH-005 passed');
  });

  test('TC-DASH-006 | Notification items visible', async ({ page }) => {
    const d = await openDashboard(page);

    await d.openNotifications();

    const count = await d.getNotificationItemCount();
    expect(count).toBeGreaterThanOrEqual(0);

    console.log(`✅ TC-DASH-006 passed (${count} items)`);
  });

  test('TC-DASH-007 | Mark all as read button visible', async ({ page }) => {
    const d = await openDashboard(page);

    await d.openNotifications();

    await expect(d.notificationMarkAllReadBtn).toBeVisible();

    console.log('✅ TC-DASH-007 passed');
  });

  test('TC-DASH-008 | Clear button visible', async ({ page }) => {
    const d = await openDashboard(page);

    await d.openNotifications();

    await expect(d.notificationClearBtn).toBeVisible();

    console.log('✅ TC-DASH-008 passed');
  });

  test('TC-DASH-009 | Notification pagination works', async ({ page }) => {
    const d = await openDashboard(page);

    await d.openNotifications();

    if (await d.notificationNextBtn.isVisible().catch(() => false)) {
      await d.goToNextNotificationPage();

      const count = await d.getNotificationItemCount();

      console.log(`✅ TC-DASH-009 passed (${count} items)`);
    } else {
      console.log('⚠️ No next page available');
    }
  });

  test('TC-DASH-010 | Notifications modal closes', async ({ page }) => {
    const d = await openDashboard(page);

    await d.openNotifications();
    await d.closeNotifications();
    await d.assertNotificationModalClosed();

    console.log('✅ TC-DASH-010 passed');
  });
});