import { test, expect, type APIResponse } from '@playwright/test';
import { getAuthToken } from '../../helpers/token.store';

const BASE_URL = 'https://hris.itmanage.com.au';

async function assertApiResponse(response: APIResponse) {
  const body = await response.json().catch(() => ({}));

  if (response.status() === 200) {
    expect(body).toBeTruthy();
    if (typeof body.success !== 'undefined') expect(body.success).toBe(true);
    if (typeof body.status !== 'undefined') expect(String(body.status).toLowerCase()).toMatch(/success|ok/);
    expect(body.data || body.rosters || body).toBeTruthy();
  } else {
    expect(body.error || body.message || body.reason).toBeTruthy();
  }

  return body;
}

  test('TC-001 Get available rosters with valid token returns 200 success', async ({ request }) => {
    const token = getAuthToken();
    test.skip(!token, 'Auth token not found; run tests/api/hris_login.spec.ts first to generate finalToken');

    const response = await request.get(`${BASE_URL}/api/attendances/available-rosters`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.status()).toBe(200);
    await assertApiResponse(response);
  });

  test('TC-002 Get available rosters with invalid token returns 401 error', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/attendances/available-rosters`, {
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    });

    expect(response.status()).toBe(401);
    await assertApiResponse(response);
  });

