import { expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

export async function expectOnDashboard(d: DashboardPage): Promise<void> {
  await expect(d.page).toHaveURL(/\/admin\/?$/);
  await expect(d.heading).toBeVisible();
}

export async function expectNotificationsOpen(d: DashboardPage): Promise<void> {
  await d.waitForNotificationsOpen();
  await expect(d.notificationModalHeading).toBeVisible();
}

export async function expectNotificationsClosed(d: DashboardPage): Promise<void> {
  await d.waitForNotificationsClosed();
}
