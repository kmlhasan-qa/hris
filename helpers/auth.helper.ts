import { request } from '@playwright/test';
import { generateTOTP } from './totp.helper';
import { setAuthToken } from './token.store';

const BASE_URL = 'https://hris.itmanage.com.au';

export interface HrisLoginAccount {
  email: string;
  password: string;
  totpSecret: string;
}

export async function loginAndGetFinalToken(account: HrisLoginAccount) {
  const apiRequest = await request.newContext();
  try {
    const loginResponse = await apiRequest.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: account.email,
        password: account.password,
      },
    });

    const loginBody = await loginResponse.json().catch(() => ({}));
    const tempToken = loginBody.temp_token || loginBody.data?.temp_token;
    if (!tempToken) {
      throw new Error(`Login failed or temp_token missing: ${JSON.stringify(loginBody)}`);
    }

    const code = generateTOTP(account.totpSecret, 6);
    const verifyResponse = await apiRequest.post(`${BASE_URL}/api/auth/2fa/verify`, {
      headers: {
        Authorization: `Bearer ${tempToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        code,
      },
    });

    const verifyBody = await verifyResponse.json().catch(() => ({}));
    const finalToken = verifyBody?.data?.token;
    if (!finalToken) {
      throw new Error(`2FA verify failed or final token missing: ${JSON.stringify(verifyBody)}`);
    }

    return finalToken;
  } finally {
    await apiRequest.dispose();
  }
}

export async function loginAndSaveAuthToken(account: HrisLoginAccount) {
  const finalToken = await loginAndGetFinalToken(account);
  setAuthToken(finalToken);
  return finalToken;
}
