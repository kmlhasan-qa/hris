import { test, expect } from '@playwright/test';
import { extractOTPFromMailTm, getLatestMailTmMessageId } from '../../helpers/mailtm.helper';

const BASE_URL = 'https://hris.itmanage.com.au';
const REGISTERED_EMAIL = 'hris001@web-library.net';
const NEW_PASSWORD = 'NewPassword123!@#';

test('TC-001 Forgot Password - get OTP via email', async ({ request }) => {
  const email = REGISTERED_EMAIL;
  const previousMessageId = await getLatestMailTmMessageId();

  const response = await request.post(`${BASE_URL}/api/auth/forgot-password`, {
    data: { email }
  });

  // expect 200 success
  expect(response.status()).toBe(200);

  const body = await response.json();
  console.log('forgot-password response:', body);
  expect(body).toBeTruthy();
  if (typeof body.success !== 'undefined') expect(body.success).toBe(true);
  if (typeof body.status_code !== 'undefined') expect(body.status_code).toBe(200);

  // Extract OTP from email
  const otp = await extractOTPFromMailTm(previousMessageId);
  console.log('OTP received:', otp);
  expect(otp).toMatch(/^\d{6}$/);
});

test('TC-002 Verify Reset Code - valid OTP', async ({ request }) => {
  const email = REGISTERED_EMAIL;
  const newPassword = NEW_PASSWORD;
  const previousMessageId = await getLatestMailTmMessageId();

  // First, request password reset to get OTP
  const forgotPasswordResponse = await request.post(`${BASE_URL}/api/auth/forgot-password`, {
    data: { email }
  });

  expect(forgotPasswordResponse.status()).toBe(200);

  // Extract OTP from email
  const otp = await extractOTPFromMailTm(previousMessageId);
  console.log('OTP received:', otp);
  expect(otp).toMatch(/^\d{6}$/);

  // Verify reset code and reset password
  const verifyResponse = await request.post(`${BASE_URL}/api/auth/verify-reset-code`, {
    data: {
      email,
      code: otp,
      password: newPassword
    }
  });

  // expect 200 success
  expect(verifyResponse.status()).toBe(200);

  const verifyBody = await verifyResponse.json();
  console.log('verify-reset-code response:', verifyBody);
  expect(verifyBody).toBeTruthy();
  if (typeof verifyBody.success !== 'undefined') expect(verifyBody.success).toBe(true);
  if (typeof verifyBody.status_code !== 'undefined') expect(verifyBody.status_code).toBe(200);

});