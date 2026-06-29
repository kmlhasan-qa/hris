import { expect, Page } from '@playwright/test';

export const BASE_URL = 'https://hris.itmanage.com.au';

export async function assertLoggedIn(page: Page) {
  await page.goto(`${BASE_URL}/admin`, {
    waitUntil: 'domcontentloaded',
  });

  if (page.url().includes('/login')) {
    throw new Error('Session invalid: redirected to login page');
  }

  await expect(page).toHaveURL(/.*\/admin/);
}

export async function gotoDepartments(page: Page) {
  await page.goto(`${BASE_URL}/admin/departments`, {
    waitUntil: 'domcontentloaded',
  });

  await page.locator(
    'input[wire\\:model\\.live\\.debounce\\.500ms="tableSearch"]'
  ).waitFor({
    state: 'visible',
    timeout: 30000,
  });
}

export async function gotoCreateDepartment(page: Page) {
  await page.goto(`${BASE_URL}/admin/departments/create`, {
    waitUntil: 'domcontentloaded',
  });

  await page.locator('input#form\\.name').waitFor({
    state: 'visible',
    timeout: 15000,
  });
}