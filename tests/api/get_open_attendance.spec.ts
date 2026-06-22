import { test, expect } from '@playwright/test';
import { getAuthToken } from '../../helpers/token.store';

const BASE_URL = 'https://hris.itmanage.com.au';

test.describe('HRIS open attendance', () => {
  test('TC-001 Get open attendance with valid token returns 200 success', async ({ request }) => {
    const token = getAuthToken();
    test.skip(!token, 'Auth token not found; run tests/api/hris_login.spec.ts first to generate finalToken');

    const response = await request.get(`${BASE_URL}/api/attendances/open`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const body = await response.json().catch(() => ({}));
    console.log('open attendance response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body).toBeTruthy();
    if (typeof body.success !== 'undefined') expect(body.success).toBe(true);
    if (typeof body.status_code !== 'undefined') expect(body.status_code).toBe(200);
    expect(body.data).toBeTruthy();
  });

  test('TC-002 Get open attendance with invalid token returns 401 error', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/attendances/open`, {
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    });

    const body = await response.json().catch(() => ({}));
    console.log('open attendance invalid token response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
    expect(body.error || body.message || body.reason).toBeTruthy();
  });
});
