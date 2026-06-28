import { Page } from '@playwright/test';

export const BASE_URL = 'https://hris.itmanage.com.au';

export async function assertLoggedIn(page: Page) {
  await page.goto(`${BASE_URL}/admin`);

  if (page.url().includes('/login')) {
    throw new Error('Session invalid: redirected to login page');
  }
}

export async function gotoPushNotificationsList(page: Page) {
  await page.goto(`${BASE_URL}/admin/push-notifications`);
  await page.waitForLoadState('networkidle');
}

export async function gotoCreatePushNotification(page: Page) {
  await page.goto(`${BASE_URL}/admin/push-notifications/create`);
  await page.waitForLoadState('networkidle');
}