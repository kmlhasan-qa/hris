import { expect } from '@playwright/test';
import { PushNotificationsListPage } from '../pages/push-notifications/PushNotificationsListPage';

export async function expectOnPushNotificationsPage(
  p: PushNotificationsListPage,
): Promise<void> {
  await expect(p.heading).toHaveText('Push Notifications');
  await expect(p.page).toHaveURL(/push-notifications/);
}

export async function expectPushNotificationsLanding(
  p: PushNotificationsListPage,
): Promise<void> {
  await expectOnPushNotificationsPage(p);
  await expect(p.breadcrumbList).toBeVisible();
  await expect(p.sendNewButton).toBeVisible();
  await expect(p.table.search).toBeVisible();
}
