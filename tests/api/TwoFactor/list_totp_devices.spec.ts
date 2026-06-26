import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const TOTP_DEVICES_ENDPOINT = '/api/2fa/totp/devices';
const REQUEST_TIMEOUT = 10;

test.describe('TOTP Devices API', () => {
  const getTotpDevices = (
    request: APIRequestContext,
    headers: Record<string, string>,
    endpoint: string = `${BASE_URL}${TOTP_DEVICES_ENDPOINT}`,
    options?: { timeout?: number }
  ) =>
    request.get(endpoint, {
      headers,
      ...options,
    });

  test('TC-001 Get TOTP devices with valid token → 200', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await getTotpDevices(
      request,
      {
        ...authHeaders(token),
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);

    console.log('TOTP devices response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Devices retrieved successfully');
  });

  test('TC-002 Get TOTP devices without token → 401', async ({
    request,
  }) => {
    const response = await getTotpDevices(
      request,
      {
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);

    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-003 Get TOTP devices with invalid token → 401', async ({
    request,
  }) => {
    const response = await getTotpDevices(
      request,
      {
        Authorization: `Bearer ${INVALID_TOKEN}`,
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);

    console.log('401 invalid token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-004 Get TOTP devices with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/2fa/totp/devices'
      );
    }).rejects.toThrow();
  });

  test('TC-005 Get TOTP devices with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await getTotpDevices(
        request,
        {
          ...authHeaders(token),
          Accept: 'application/json',
        },
        `${BASE_URL}${TOTP_DEVICES_ENDPOINT}`,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});