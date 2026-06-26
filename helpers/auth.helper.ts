import { request } from '@playwright/test';
import { HRIS_BASE_URL, type HrisLoginAccount } from './config';
import { generateTOTP } from './totp.helper';
import { setAuthToken } from './token.store';

export type { HrisLoginAccount } from './config';

/** Run email/password + 2FA login flow and return final auth token. */
export async function loginAndGetFinalToken(
  account: HrisLoginAccount
): Promise<string | null> {
  const ctx = await request.newContext({
    baseURL: HRIS_BASE_URL,
  });

  try {
    // =========================
    // STEP 1: LOGIN
    // =========================
    const loginRes = await ctx.post('/api/auth/login', {
      data: {
        email: account.email,
        password: account.password,
      },
      timeout: 10000,
    });

    if (!loginRes.ok()) {
      console.log(`Login failed with status: ${loginRes.status()}`);
      return null;
    }

    const loginBody = await loginRes.json().catch(() => ({}));

    console.log('login response status:', loginRes.status());

    const tempToken =
      loginBody?.temp_token || loginBody?.data?.temp_token;

    if (!tempToken) {
      console.log('temp_token missing:', loginBody);
      return null;
    }

    // =========================
    // STEP 2: VERIFY 2FA
    // =========================
    const verifyRes = await ctx.post('/api/auth/2fa/verify', {
      headers: {
        Authorization: `Bearer ${tempToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        code: generateTOTP(account.totpSecret, 6),
      },
      timeout: 10000,
    });

    if (!verifyRes.ok()) {
      console.log(`2FA verify failed with status: ${verifyRes.status()}`);
      return null;
    }

    const verifyBody = await verifyRes.json().catch(() => ({}));

    console.log('2FA verify response status:', verifyRes.status());

    const finalToken = verifyBody?.data?.token;

    if (!finalToken) {
      console.log('final token missing:', verifyBody);
      return null;
    }

    return finalToken;
  } catch (error) {
    console.log('Auth flow failed:', error);
    return null;
  } finally {
    await ctx.dispose();
  }
}

/** Log in and persist the resulting token for the rest of the suite. */
export async function loginAndSaveAuthToken(
  account: HrisLoginAccount
): Promise<string | null> {
  const finalToken = await loginAndGetFinalToken(account);

  if (!finalToken) {
    console.log('Auth token unavailable. Auth-dependent tests may skip.');
    return null;
  }

  setAuthToken(finalToken);
  return finalToken;
}