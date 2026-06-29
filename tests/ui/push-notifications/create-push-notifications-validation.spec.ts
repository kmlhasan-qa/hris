import { test, expect } from '../../../src/core/fixtures';

test.describe('Push Notifications - Create Validation', () => {
  test('shows validation errors when submitting an empty form', async ({
    pushNotificationForm,
  }) => {
    await pushNotificationForm.goto();
    await pushNotificationForm.submit();

    const error = pushNotificationForm.page
      .locator('.fi-fo-field-wrp-error-message')
      .or(pushNotificationForm.page.getByRole('alert'));

    await expect(error.first()).toBeVisible();
  });
});
