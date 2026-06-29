import { test } from '../../../src/core/fixtures';
import { expectPushNotificationsLanding } from '../../../src/assertions/pushNotifications.assertions';

test.describe('Push Notifications - Page', () => {
  test('loads the page with its core controls', async ({ pushNotifications }) => {
    await pushNotifications.goto();
    await expectPushNotificationsLanding(pushNotifications);
  });
});
