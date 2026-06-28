import { test, expect } from '@playwright/test';
import { PushNotificationsCreatePage } from '../../../pages/PushNotificationsCreatePage';
import {
  assertLoggedIn,
  gotoCreatePushNotification,
} from './_helpers';

test.describe('Push Notifications - Create Validation', () => {
  test('should validate required fields on submit', async ({ page }) => {
    await assertLoggedIn(page);

    const pn = new PushNotificationsCreatePage(page);
    await gotoCreatePushNotification(page);

    await pn.submit();

    // ✅ FIXED: no invalid CSS, proper Playwright locators
    const errorLocator = page
      .locator('.fi-fo-field-wrp-error-message')
      .or(page.locator('[role="alert"]'))
      .or(page.locator('.text-red-500'))
      .or(page.locator('text=required'));

    await expect(errorLocator.first()).toBeVisible({ timeout: 10000 });
  });
});