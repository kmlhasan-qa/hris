import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const TWO_FA_ENDPOINT = '/api/2fa';

test.describe('2FA Status API', () => {
  test('TC-001 Get 2FA status with valid token → 200', async ({ request }) => {
    const token = requireToken();

    const response = await request.get(
      `${BASE_URL}${TWO_FA_ENDPOINT}`,
      {
        headers: {
          ...authHeaders(token),
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);

    console.log('2FA status response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('2FA status retrieved successfully');
  });

  test('TC-002 Get 2FA status without token → 401', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${TWO_FA_ENDPOINT}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);

    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-003 Get 2FA status with invalid token → 401', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${TWO_FA_ENDPOINT}`,
      {
        headers: {
          Authorization: `Bearer ${INVALID_TOKEN}`,
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);

    console.log('401 invalid token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });
});