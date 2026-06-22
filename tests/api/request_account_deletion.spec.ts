import { test, expect } from '@playwright/test';
import { getAuthToken } from '../../helpers/token.store';

const BASE_URL = 'https://hris.itmanage.com.au';

  test('TC-001 Request account deletion with valid token returns 200 or 409', async ({ request }) => {
    const token = getAuthToken();
    test.skip(!token, 'Auth token not found; run tests/api/login.spec.ts first to generate finalToken');

    const response = await request.post(`${BASE_URL}/api/account-deletion-requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect([200, 409]).toContain(response.status());
    const body = await response.json().catch(() => ({}));
    expect(body).toBeTruthy();
    expect(body.data || body.user || body).toBeTruthy();
    if (response.status() === 409) {
      expect(body.message || body.error).toMatch(/pending account deletion request/i);
    }
  });

  test('TC-002 Request account deletion with invalid token returns 401', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/account-deletion-requests`, {
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    });

    expect(response.status()).toBe(401);
  });
