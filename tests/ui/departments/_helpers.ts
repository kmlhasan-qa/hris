import { expect, Page } from '@playwright/test';

export const BASE_URL = 'https://hris.itmanage.com.au';

export async function gotoDepartments(page: Page) {
  await page.goto(`${BASE_URL}/admin/departments`);
  await page.waitForLoadState('networkidle');
}

export async function assertLoggedIn(page: Page) {
  await page.goto(`${BASE_URL}/admin`);

  if (page.url().includes('/login')) {
    throw new Error('Session invalid: redirected to login page');
  }
}