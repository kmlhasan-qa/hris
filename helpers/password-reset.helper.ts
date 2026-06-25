import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import { extractOTPFromMailTm, getLatestMailTmMessageId } from './mailtm.helper';

const FORGOT_PASSWORD_ENDPOINT = '/api/auth/forgot-password';
const VERIFY_RESET_CODE_ENDPOINT = '/api/auth/verify-reset-code';

export type ResetPasswordPayload = {
  email: string;
  code: string;
  password: string;
};

export function assertSuccessResponse(body: any) {
  expect(body).toBeTruthy();

  if (typeof body.success !== 'undefined') {
    expect(body.success).toBe(true);
  }

  if (typeof body.status_code !== 'undefined') {
    expect(body.status_code).toBe(200);
  }
}

export async function requestForgotPassword(
  request: APIRequestContext,
  email: string
): Promise<APIResponse> {
  return request.post(FORGOT_PASSWORD_ENDPOINT, {
    data: { email },
  });
}

export async function requestResetOtp(
  request: APIRequestContext,
  email: string
): Promise<string> {
  const previousMessageId = await getLatestMailTmMessageId();

  const response = await requestForgotPassword(request, email);
  expect(response.status()).toBe(200);

  const body = await response.json();
  console.log('forgot-password response:', body);

  assertSuccessResponse(body);

  const otp = await extractOTPFromMailTm(previousMessageId);

  console.log('OTP received:', otp);
  expect(otp).toMatch(/^\d{6}$/);

  return otp;
}

export async function verifyResetCode(
  request: APIRequestContext,
  payload: ResetPasswordPayload
): Promise<APIResponse> {
  return request.post(VERIFY_RESET_CODE_ENDPOINT, {
    data: payload,
  });
}