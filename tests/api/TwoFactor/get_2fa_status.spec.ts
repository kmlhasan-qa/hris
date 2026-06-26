import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const TWO_FA_ENDPOINT = '/api/2fa';
const REQUEST_TIMEOUT = 10;

test.describe('2FA Status API', () => {
  const get2FAStatus = (
    request: APIRequestContext,
    headers: Record<string, string>,
    endpoint: string = `${BASE_URL}${TWO_FA_ENDPOINT}`,
    options?: { timeout?: number }
  ) =>
    request.get(endpoint, {
      headers,
      ...options,
    });

  test('TC-001 Get 2FA status with valid token → 200', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await get2FAStatus(
      request,
      {
        ...authHeaders(token),
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);

    console.log('2FA status response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('2FA status retrieved successfully');
  });

  test('TC-002 Get 2FA status without token → 401', async ({
    request,
  }) => {
    const response = await get2FAStatus(
      request,
      {
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);

    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-003 Get 2FA status with invalid token → 401', async ({
    request,
  }) => {
    const response = await get2FAStatus(
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

  test('TC-004 Get 2FA status with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/2fa'
      );
    }).rejects.toThrow();
  });

  test('TC-005 Get 2FA status with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await get2FAStatus(
        request,
        {
          ...authHeaders(token),
          Accept: 'application/json',
        },
        `${BASE_URL}${TWO_FA_ENDPOINT}`,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});