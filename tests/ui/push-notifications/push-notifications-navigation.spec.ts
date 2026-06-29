import { test, expect } from '../../../src/core/fixtures';

test.describe('Push Notifications - Navigation', () => {
  test('navigates to the create page via the Send New button', async ({ pushNotifications }) => {
    await pushNotifications.goto();

    await pushNotifications.clickSendNew();

    await expect(pushNotifications.page).toHaveURL(/push-notifications\/create/);
  });
});
