import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const TOTP_DEVICES_ENDPOINT = '/api/2fa/totp/devices';

test.describe('TOTP Devices API', () => {
  test('TC-001 Get TOTP devices with valid token → 200', async ({ request }) => {
    const token = requireToken();
    if (!token) {
      console.log('Skipping test: token unavailable');
      return;
    }

    const response = await request.get(
      `${BASE_URL}${TOTP_DEVICES_ENDPOINT}`,
      {
        headers: {
          ...authHeaders(token),
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);

    console.log('TOTP devices response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Devices retrieved successfully');
  });

  test('TC-002 Get TOTP devices without token → 401', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${TOTP_DEVICES_ENDPOINT}`,
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

  test('TC-003 Get TOTP devices with invalid token → 401', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${TOTP_DEVICES_ENDPOINT}`,
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