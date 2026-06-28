import { test, expect, Page } from '@playwright/test';
import { PushNotificationsPage } from '../../../pages/PushNotificationsPage';

const BASE_URL = 'https://hris.itmanage.com.au';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function livewireSettle(page: Page, ms = 0) {
  await page.waitForLoadState('networkidle');
  if (ms > 0) await page.waitForTimeout(ms);
}

async function waitUntil(fn: () => Promise<void>, timeout = 10000) {
  await expect(fn).toPass({ timeout });
}

test.describe('Push Notifications — Create', () => {
  test.describe.configure({ retries: 0 });

  test('TC-PN-CREATE | Create push notification suite', async ({ page }) => {
    test.setTimeout(180_000);

    // ─── Reuse authenticated session ───────────────────────────────────────
    await page.goto(`${BASE_URL}/admin`);

    if (page.url().includes('/login')) {
      throw new Error('Session invalid: redirected to login page');
    }

    console.log('✅ Logged in via reused session.');

    // ─── Navigate to Create page ───────────────────────────────────────────
    await page.goto(`${BASE_URL}/admin/push-notifications/create`);
    await livewireSettle(page);

    console.log('✅ Navigated to Create Push Notification page.');

    const titleInput = page.locator('input#form\\.title');
    const sendToAllBtn = page.locator('button[role="switch"]#form\\.send_to_all');
    const deptSelect = page.locator('select#form\\.department');
    const siteSelect = page.locator('select#form\\.site');
    const bodyTextarea = page.locator('textarea#form\\.body');
    const imageUpload = page.locator('.fi-fo-file-upload');
    const submitBtn = page.locator('button[type="submit"]', {
      hasText: 'Send Push Notification',
    });
    const cancelBtn = page.locator('.fi-sc-actions button', {
      hasText: 'Cancel',
    });

    // keep all remaining test steps unchanged from C001 onward...
    // C001–C013 same as your current spec
  });
});