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

    // 🔥 stable generic validation selector (Filament/Livewire safe)
    const error = page.locator(
      '.text-red-500, .fi-fo-field-wrp-error-message, [role="alert"]'
    );

    await expect(error.first()).toBeVisible({ timeout: 10000 });
  });
});