import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const FCM_TOKEN_ENDPOINT = '/api/notifications/fcm-token';

test.describe('Notifications FCM Token API', () => {
  test('TC-001 Update FCM token with valid payload → 200', async ({ request }) => {
    const token = requireToken();
    if (!token) {
      console.log('Skipping test: token unavailable');
      return;
    }

    const response = await request.post(
      `${BASE_URL}${FCM_TOKEN_ENDPOINT}`,
      {
        headers: {
          ...authHeaders(token),
          Accept: 'application/json',
        },
        data: {
          fcm_token: `test-fcm-token-${Date.now()}`,
        },
      }
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

  test('TC-002 Update FCM token without token → 401', async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}${FCM_TOKEN_ENDPOINT}`,
      {
        headers: {
          Accept: 'application/json',
        },
        data: {
          fcm_token: 'sample-fcm-token',
        },
      }
    );

    const body = await parseBody(response);

    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-003 Update FCM token with invalid token → 401', async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}${FCM_TOKEN_ENDPOINT}`,
      {
        headers: {
          Authorization: `Bearer ${INVALID_TOKEN}`,
          Accept: 'application/json',
        },
        data: {
          fcm_token: 'sample-fcm-token',
        },
      }
    );

    const body = await parseBody(response);

    console.log('401 invalid token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-004 Missing fcm_token → 422', async ({ request }) => {
    const token = requireToken();
    if (!token) {
      console.log('Skipping test: token unavailable');
      return;
    }

    const response = await request.post(
      `${BASE_URL}${FCM_TOKEN_ENDPOINT}`,
      {
        headers: {
          ...authHeaders(token),
          Accept: 'application/json',
        },
        data: {},
      }
    );

    const body = await parseBody(response);

    console.log('422 missing fcm_token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
  });

  test('TC-005 Invalid fcm_token type → 422', async ({ request }) => {
    const token = requireToken();
    if (!token) {
      console.log('Skipping test: token unavailable');
      return;
    }

    const response = await request.post(
      `${BASE_URL}${FCM_TOKEN_ENDPOINT}`,
      {
        headers: {
          ...authHeaders(token),
          Accept: 'application/json',
        },
        data: {
          fcm_token: 12345,
        },
      }
    );

    const body = await parseBody(response);

    console.log('422 invalid fcm_token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
  });
});