import { test, expect } from '@playwright/test';
import { MAILTM } from '../../../helpers/config';
import {
  requestResetOtp,
  verifyResetCode,
  assertSuccessResponse,
} from '../../../helpers/password-reset.helper';

test.describe('Forgot Password API', () => {
  const REGISTERED_EMAIL = MAILTM.email;
  const NEW_PASSWORD = 'NewPassword123!@#';

  test('TC-001 Forgot password returns OTP via email', async ({ request }) => {
    await requestResetOtp(request, REGISTERED_EMAIL);
  });

  test('TC-002 Verify reset code with valid OTP returns 200 success', async ({ request }) => {
    const otp = await requestResetOtp(request, REGISTERED_EMAIL);

    const response = await verifyResetCode(request, {
      email: REGISTERED_EMAIL,
      code: otp,
      password: NEW_PASSWORD,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('verify-reset-code response:', body);

    assertSuccessResponse(body);
  });
});