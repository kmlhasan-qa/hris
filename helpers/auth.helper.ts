import { request } from '@playwright/test';
import { HRIS_BASE_URL, type HrisLoginAccount } from './config';
import { generateTOTP } from './totp.helper';
import { setAuthToken } from './token.store';

export type { HrisLoginAccount } from './config';

/** Run the email/password + 2FA login flow and return the final auth token. */
export async function loginAndGetFinalToken(account: HrisLoginAccount): Promise<string> {
  const ctx = await request.newContext({ baseURL: HRIS_BASE_URL });
  try {
    const loginRes = await ctx.post('/api/auth/login', {
      data: { email: account.email, password: account.password },
    });
    const loginBody = await loginRes.json().catch(() => ({}));
    const tempToken = loginBody.temp_token || loginBody.data?.temp_token;
    if (!tempToken) {
      throw new Error(`Login failed or temp_token missing: ${JSON.stringify(loginBody)}`);
    }

    const verifyRes = await ctx.post('/api/auth/2fa/verify', {
      headers: { Authorization: `Bearer ${tempToken}`, 'Content-Type': 'application/json' },
      data: { code: generateTOTP(account.totpSecret, 6) },
    });
    const verifyBody = await verifyRes.json().catch(() => ({}));
    const finalToken = verifyBody?.data?.token;
    if (!finalToken) {
      throw new Error(`2FA verify failed or final token missing: ${JSON.stringify(verifyBody)}`);
    }

    return finalToken;
  } finally {
    await ctx.dispose();
  }
}

/** Log in and persist the resulting token for the rest of the suite. */
export async function loginAndSaveAuthToken(account: HrisLoginAccount): Promise<string> {
  const finalToken = await loginAndGetFinalToken(account);
  setAuthToken(finalToken);
  return finalToken;
}
