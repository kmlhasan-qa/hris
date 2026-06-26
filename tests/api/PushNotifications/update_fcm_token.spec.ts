import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const FCM_TOKEN_ENDPOINT = '/api/notifications/fcm-token';
const REQUEST_TIMEOUT = 10;

const VALID_PAYLOAD = {
  fcm_token: `test-fcm-token-${Date.now()}`,
};

test.describe('Notifications FCM Token API', () => {
  const updateFcmToken = (
    request: APIRequestContext,
    headers: Record<string, string>,
    data: Record<string, any>,
    endpoint: string = `${BASE_URL}${FCM_TOKEN_ENDPOINT}`,
    options?: { timeout?: number }
  ) =>
    request.post(endpoint, {
      headers,
      data,
      ...options,
    });

  test('TC-001 Update FCM token with valid payload → 200', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await updateFcmToken(
      request,
      {
        ...authHeaders(token),
        Accept: 'application/json',
      },
      VALID_PAYLOAD
    );

    const body = await parseBody(response);

    console.log(
      'update fcm token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('FCM token updated successfully');
  });

  test('TC-002 Update FCM token without token → 401', async ({
    request,
  }) => {
    const response = await updateFcmToken(
      request,
      {
        Accept: 'application/json',
      },
      {
        fcm_token: 'sample-fcm-token',
      }
    );

    const body = await parseBody(response);

    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-003 Update FCM token with invalid token → 401', async ({
    request,
  }) => {
    const response = await updateFcmToken(
      request,
      {
        Authorization: `Bearer ${INVALID_TOKEN}`,
        Accept: 'application/json',
      },
      {
        fcm_token: 'sample-fcm-token',
      }
    );

    const body = await parseBody(response);

    console.log('401 invalid token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-004 Missing fcm_token → 422', async ({ request }) => {
    const token = requireToken();

    const response = await updateFcmToken(
      request,
      {
        ...authHeaders(token),
        Accept: 'application/json',
      },
      {}
    );

    const body = await parseBody(response);

    console.log('422 missing fcm_token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
  });

  test('TC-005 Invalid fcm_token type → 422', async ({ request }) => {
    const token = requireToken();

    const response = await updateFcmToken(
      request,
      {
        ...authHeaders(token),
        Accept: 'application/json',
      },
      {
        fcm_token: 12345,
      }
    );

    const body = await parseBody(response);

    console.log('422 invalid fcm_token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
  });

  test('TC-006 Update FCM token with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.post(
        'https://invalid-domain-for-testing-12345.com/api/notifications/fcm-token'
      );
    }).rejects.toThrow();
  });

  test('TC-007 Update FCM token with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await updateFcmToken(
        request,
        {
          ...authHeaders(token),
          Accept: 'application/json',
        },
        VALID_PAYLOAD,
        `${BASE_URL}${FCM_TOKEN_ENDPOINT}`,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});