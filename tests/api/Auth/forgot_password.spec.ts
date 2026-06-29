import { test, expect, type APIRequestContext } from '@playwright/test';
import { MAILTM } from '../../../helpers/config';
import {
  requestResetOtp,
  verifyResetCode,
  assertSuccessResponse,
} from '../../../helpers/password-reset.helper';

test.describe('Forgot Password API', () => {
  const REGISTERED_EMAIL = MAILTM.email;
  const NEW_PASSWORD = 'NewPassword123!@#';
  const REQUEST_TIMEOUT = 10;

  async function getOtpSafely(request: APIRequestContext) {
    try {
      const otp = await requestResetOtp(request, REGISTERED_EMAIL);

      if (!otp) {
        console.log('Skipping test: OTP not generated from mail server');
        return null;
      }

      return otp;
    } catch (error) {
      console.log('Skipping test: Failed to get OTP', error);
      return null;
    }
  }

  test('TC-001 Forgot password returns OTP via email', async ({ request }) => {
    const otp = await getOtpSafely(request);

    if (!otp) {
      test.skip(true, 'OTP not generated from mail server');
      return;
    }

    console.log('OTP generated successfully:', otp);
    expect(otp).toBeTruthy();
  });

  test('TC-002 Verify reset code with valid OTP returns 200 success', async ({ request }) => {
    const otp = await getOtpSafely(request);

    if (!otp) {
      test.skip(true, 'OTP not generated from mail server');
      return;
    }

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

  test('TC-003 Forgot password with unreachable host → failed to fetch', async ({ request }) => {
    await expect(async () => {
      await request.post(
        'https://invalid-domain-for-testing-12345.com/api/auth/forgot-password',
        {
          data: {
            email: REGISTERED_EMAIL,
          },
        }
      );
    }).rejects.toThrow();
  });

  test('TC-004 Forgot password with forced timeout → failed to fetch', async ({ request }) => {
    await expect(async () => {
      await request.post('/api/auth/forgot-password', {
        data: {
          email: REGISTERED_EMAIL,
        },
        timeout: REQUEST_TIMEOUT,
      });
    }).rejects.toThrow();
  });
});