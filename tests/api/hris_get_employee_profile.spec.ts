import { test, expect } from '@playwright/test';
import { getAuthToken } from '../../helpers/token.store';

const BASE_URL = 'https://hris.itmanage.com.au';

test.describe('HRIS employee profile', () => {
  test('TC-002 Get employee profile with valid final token returns 200', async ({ request }) => {
    const token = getAuthToken();
    test.skip(!token, 'Auth token not found; run tests/api/hris_login.spec.ts first to generate finalToken');

    const response = await request.get(`${BASE_URL}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json().catch(() => ({}));
    expect(body).toBeTruthy();
    expect(body.data || body.user || body).toBeTruthy();
  });

  test('TC-003 Get employee profile with invalid token returns 401', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/auth/profile`, {
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    });

    expect(response.status()).toBe(401);
  });
});
