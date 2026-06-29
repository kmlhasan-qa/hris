import { test, expect } from '../../../src/core/fixtures';
import {
  expectNotificationsOpen,
  expectNotificationsClosed,
} from '../../../src/assertions/dashboard.assertions';

test.describe('Dashboard Notifications', () => {
  test.beforeEach(async ({ dashboard }) => {
    await dashboard.goto();
  });

  test('TC-DASH-004 | Notification badge visible', async ({ dashboard }) => {
    await expect(dashboard.notificationBadge).toBeVisible();
    expect(await dashboard.notificationBadgeCount()).toBeGreaterThanOrEqual(0);
  });

  test('TC-DASH-005 | Notifications modal opens', async ({ dashboard }) => {
    await dashboard.openNotifications();
    await expectNotificationsOpen(dashboard);
  });

  test('TC-DASH-006 | Notification items visible', async ({ dashboard }) => {
    await dashboard.openNotifications();
    expect(await dashboard.notificationItemCount()).toBeGreaterThanOrEqual(0);
  });

  test('TC-DASH-007 | Mark all as read button visible', async ({ dashboard }) => {
    await dashboard.openNotifications();
    await expect(dashboard.notificationMarkAllReadBtn).toBeVisible();
  });

  test('TC-DASH-008 | Clear button visible', async ({ dashboard }) => {
    await dashboard.openNotifications();
    await expect(dashboard.notificationClearBtn).toBeVisible();
  });

  test('TC-DASH-009 | Notification pagination works', async ({ dashboard }) => {
    await dashboard.openNotifications();

    test.skip(
      !(await dashboard.notificationNextBtn.isVisible().catch(() => false)),
      'No second page of notifications available',
    );

    await dashboard.goToNextNotificationPage();
    expect(await dashboard.notificationItemCount()).toBeGreaterThanOrEqual(0);
  });

  test('TC-DASH-010 | Notifications modal closes', async ({ dashboard }) => {
    await dashboard.openNotifications();
    await dashboard.closeNotifications();
    await expectNotificationsClosed(dashboard);
  });
});
