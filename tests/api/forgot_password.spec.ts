import { test, expect, type APIRequestContext } from '@playwright/test';
import { extractOTPFromMailTm, getLatestMailTmMessageId } from '../../helpers/mailtm.helper';
import { MAILTM } from '../../helpers/config';
import { BASE_URL } from './_shared';

const REGISTERED_EMAIL = MAILTM.email;
const NEW_PASSWORD = 'NewPassword123!@#';

/** Trigger a password reset and return the 6-digit OTP delivered by email. */
async function requestResetOtp(request: APIRequestContext, email: string): Promise<string> {
  const previousMessageId = await getLatestMailTmMessageId();

  const response = await request.post(`${BASE_URL}/api/auth/forgot-password`, { data: { email } });
  expect(response.status()).toBe(200);

  const body = await response.json();
  console.log('forgot-password response:', body);
  expect(body).toBeTruthy();
  if (typeof body.success !== 'undefined') expect(body.success).toBe(true);
  if (typeof body.status_code !== 'undefined') expect(body.status_code).toBe(200);

  const otp = await extractOTPFromMailTm(previousMessageId);
  console.log('OTP received:', otp);
  expect(otp).toMatch(/^\d{6}$/);
  return otp;
}

test('TC-001 Forgot Password - get OTP via email', async ({ request }) => {
  await requestResetOtp(request, REGISTERED_EMAIL);
});

test('TC-002 Verify Reset Code - valid OTP', async ({ request }) => {
  const otp = await requestResetOtp(request, REGISTERED_EMAIL);

  const verifyResponse = await request.post(`${BASE_URL}/api/auth/verify-reset-code`, {
    data: { email: REGISTERED_EMAIL, code: otp, password: NEW_PASSWORD },
  });
  expect(verifyResponse.status()).toBe(200);

  const verifyBody = await verifyResponse.json();
  console.log('verify-reset-code response:', verifyBody);
  expect(verifyBody).toBeTruthy();
  if (typeof verifyBody.success !== 'undefined') expect(verifyBody.success).toBe(true);
  if (typeof verifyBody.status_code !== 'undefined') expect(verifyBody.status_code).toBe(200);
});
