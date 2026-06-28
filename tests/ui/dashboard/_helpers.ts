import { Page } from '@playwright/test';
import { DashboardPage } from '../../../pages/DashboardPage';

const BASE_URL = 'https://hris.itmanage.com.au';

export async function openDashboard(page: Page) {
  await page.goto(`${BASE_URL}/admin`, {
    waitUntil: 'domcontentloaded',
  });

  await page.waitForLoadState('networkidle');

  if (page.url().includes('/login')) {
    throw new Error('Session invalid. Re-run global setup.');
  }

  return new DashboardPage(page);
}