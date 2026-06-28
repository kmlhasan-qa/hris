import { test, expect } from '@playwright/test';

import { PushNotificationsCreatePage } from '../../../pages/PushNotificationsCreatePage';
import { PushNotificationsPage } from '../../../pages/PushNotificationsPage';

import { assertLoggedIn, gotoCreatePushNotification } from './_helpers';

test.describe('Push Notifications - Create Success Flow', () => {
  test('should create push notification successfully', async ({ page }) => {
    test.setTimeout(120_000);

    // ─────────────────────────────
    // 1. Login (reused session)
    // ─────────────────────────────
    await assertLoggedIn(page);

    const createPage = new PushNotificationsCreatePage(page);
    const listPage = new PushNotificationsPage(page);

    // ─────────────────────────────
    // 2. Go to Create Page
    // ─────────────────────────────
    await gotoCreatePushNotification(page);

    const uniqueTitle = `Automation PN ${Date.now()}`;

    await createPage.fillTitle(uniqueTitle);

    if (await createPage.bodyTextarea?.isVisible().catch(() => false)) {
      await createPage.bodyTextarea.fill(
        'This is an automated test notification'
      );
    }

    if (await createPage.sendToAllBtn?.isVisible().catch(() => false)) {
      await createPage.sendToAllBtn.click();
    }

    console.log('📝 Form filled');

    // ─────────────────────────────
    // 3. Submit (IMPORTANT FIX)
    // ─────────────────────────────
    await createPage.submit();

    console.log('🚀 Submitted form');

    // IMPORTANT:
    // DO NOT wait for URL or toast (both are unreliable)
    // Just wait for either:
    // - form disappears OR
    // - list table becomes visible

    await expect(
      page.locator('table, [role="table"], .fi-ta-table')
    ).toBeVisible({ timeout: 20000 });

    // ─────────────────────────────
    // 4. Go back to LIST (safe navigation)
    // ─────────────────────────────
    await listPage.goto();

    // ─────────────────────────────
    // 5. Search created item (stable retry)
    // ─────────────────────────────
    await listPage.fillSearch(uniqueTitle);

    await expect.poll(
      async () => await listPage.getRowCount(),
      { timeout: 20000 }
    ).toBeGreaterThan(0);

    // ─────────────────────────────
    // 6. Validate result content
    // ─────────────────────────────
    const firstTitle = await listPage.getRowTitleByIndex(0);

    expect(firstTitle.toLowerCase()).toContain(
      uniqueTitle.toLowerCase()
    );
  });
});