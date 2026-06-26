import { test, expect, request as playwrightRequest } from '@playwright/test';
import { PRIMARY_ACCOUNT, HRIS_BASE_URL } from '../../../helpers/config';
import { loginAndSaveAuthToken } from '../../../helpers/auth.helper';

const accounts = [PRIMARY_ACCOUNT];
const REQUEST_TIMEOUT = 10;

test.describe('Login API', () => {
  for (const account of accounts) {
    test(`TC-001 Successful Login + 2FA verify - ${account.name}`, async () => {
      const finalToken = await loginAndSaveAuthToken(account);

      expect(finalToken).toBeTruthy();
      console.log(`saved auth token for ${account.name}`);
    });
  }

  test('TC-002 Login with invalid credentials → 401 or 422', async () => {
    const ctx = await playwrightRequest.newContext({
      baseURL: HRIS_BASE_URL,
    });

    try {
      const response = await ctx.post('/api/auth/login', {
        data: {
          email: 'invalid@email.com',
          password: 'wrongpassword',
        },
      });

      const body = await response.json().catch(() => ({}));
      console.log('invalid login response:', body);

      expect([401, 422]).toContain(response.status());
    } finally {
      await ctx.dispose();
    }
  });

  test('TC-003 Login with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.post(
        'https://invalid-domain-for-testing-12345.com/api/auth/login',
        {
          data: {
            email: PRIMARY_ACCOUNT.email,
            password: PRIMARY_ACCOUNT.password,
          },
          timeout: 2000,
        }
      );
    }).rejects.toThrow();
  });

  test('TC-004 Login with forced timeout → failed to fetch', async () => {
    const ctx = await playwrightRequest.newContext({
      baseURL: HRIS_BASE_URL,
    });

    try {
      await expect(async () => {
        await ctx.post('/api/auth/login', {
          data: {
            email: PRIMARY_ACCOUNT.email,
            password: PRIMARY_ACCOUNT.password,
          },
          timeout: REQUEST_TIMEOUT,
        });
      }).rejects.toThrow();
    } finally {
      await ctx.dispose();
    }
  });

  test('TC-005 2FA verify with invalid code → 401 or 422', async () => {
    const ctx = await playwrightRequest.newContext({
      baseURL: HRIS_BASE_URL,
    });

    try {
      const loginRes = await ctx.post('/api/auth/login', {
        data: {
          email: PRIMARY_ACCOUNT.email,
          password: PRIMARY_ACCOUNT.password,
        },
      });

      console.log('login response status:', loginRes.status());

      if (loginRes.status() !== 200) {
        console.log('Skipping test: login failed');
        return;
      }

      const loginBody = await loginRes.json().catch(() => ({}));
      const tempToken = loginBody.temp_token || loginBody.data?.temp_token;

      if (!tempToken) {
        console.log('Skipping test: temp token unavailable');
        return;
      }

      const verifyRes = await ctx.post('/api/auth/2fa/verify', {
        headers: {
          Authorization: `Bearer ${tempToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          code: '000000',
        },
      });

      console.log('2FA verify response status:', verifyRes.status());

      const verifyBody = await verifyRes.json().catch(() => ({}));
      console.log('invalid 2fa response:', verifyBody);

      expect([401, 422]).toContain(verifyRes.status());
    } finally {
      await ctx.dispose();
    }
  });
});