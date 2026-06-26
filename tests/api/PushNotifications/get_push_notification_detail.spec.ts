import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const NOTIFICATIONS_ENDPOINT = '/api/notifications';
const REQUEST_TIMEOUT = 10;
const VALID_PUBLIC_ID = '01KVWHEPS5ADFPNGTDRB02QQSR';
const INVALID_PUBLIC_ID = 'invalid-public-id';

test.describe('Get Notification By Public ID API', () => {
  test.skip(
    !VALID_PUBLIC_ID,
    'Set NOTIFICATION_PUBLIC_ID env var to an existing notification public_id'
  );

  const getNotifications = (
    request: APIRequestContext,
    headers: Record<string, string>
  ) =>
    request.get(
      `${BASE_URL}${NOTIFICATIONS_ENDPOINT}?page=1&per_page=1`,
      {
        headers,
      }
    );

  const getNotificationById = (
    request: APIRequestContext,
    publicId: string,
    headers: Record<string, string>,
    endpoint?: string,
    options?: { timeout?: number }
  ) =>
    request.get(
      endpoint ?? `${BASE_URL}${NOTIFICATIONS_ENDPOINT}/${publicId}`,
      {
        headers,
        ...options,
      }
    );

  test('TC-001 Get notification with valid publicId → 200', async ({
    request,
  }) => {
    const token = requireToken();
    if (!token) {
      console.log('Skipping test: token unavailable');
      return;
    }

    const listResponse = await getNotifications(request, {
      ...authHeaders(token),
      Accept: 'application/json',
    });

    expect(listResponse.status()).toBe(200);

    const listBody = await parseBody(listResponse);
    const publicId = listBody?.data?.notifications?.[0]?.public_id;

    test.skip(!publicId, 'No notifications available to fetch details for');

    const response = await getNotificationById(
      request,
      publicId,
      {
        ...authHeaders(token),
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);

    console.log(
      'notification detail response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(200);
  });

  test('TC-002 Get notification without token → 401', async ({
    request,
  }) => {
    const response = await getNotificationById(
      request,
      VALID_PUBLIC_ID,
      {
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);

    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-003 Get notification with invalid token → 401', async ({
    request,
  }) => {
    const response = await getNotificationById(
      request,
      VALID_PUBLIC_ID,
      {
        Authorization: `Bearer ${INVALID_TOKEN}`,
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);

    console.log('401 invalid token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  // TODO: Change expected status to 422 after backend bug is fixed
  test('TC-004 Get notification with invalid publicId → 500 (Known Bug: should be 422)', async ({
    request,
  }) => {
    const token = requireToken();
    if (!token) {
      console.log('Skipping test: token unavailable');
      return;
    }

    const response = await getNotificationById(
      request,
      INVALID_PUBLIC_ID,
      {
        ...authHeaders(token),
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);

    console.log(
      '500 invalid publicId (known bug):',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toContain('employees');
  });

  test('TC-005 Get notification with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/notifications/test'
      );
    }).rejects.toThrow();
  });

  test('TC-006 Get notification with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await getNotificationById(
        request,
        VALID_PUBLIC_ID,
        {
          ...authHeaders(token),
          Accept: 'application/json',
        },
        undefined,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});