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

const DEFAULT_PARAMS = {
  page: 1,
  per_page: 20,
};

test.describe('Notifications API', () => {
  const getNotifications = (
    request: APIRequestContext,
    headers: Record<string, string>,
    params: Record<string, any> = DEFAULT_PARAMS,
    endpoint: string = `${BASE_URL}${NOTIFICATIONS_ENDPOINT}`,
    options?: { timeout?: number }
  ) =>
    request.get(endpoint, {
      headers,
      params,
      ...options,
    });

  const markAsRead = (
    request: APIRequestContext,
    publicId: string,
    headers: Record<string, string>,
    endpoint?: string,
    options?: { timeout?: number }
  ) =>
    request.patch(
      endpoint ?? `${BASE_URL}${NOTIFICATIONS_ENDPOINT}/${publicId}/read`,
      {
        headers,
        ...options,
      }
    );

  test('TC-001 Get notifications and validate mark as read flow → 200 then 400', async ({
    request,
  }) => {
    const token = requireToken();

    // =========================
    // STEP 1: GET NOTIFICATIONS
    // =========================
    const response = await getNotifications(
      request,
      {
        ...authHeaders(token),
        Accept: 'application/json',
      },
      DEFAULT_PARAMS
    );

    const body = await parseBody(response);

    console.log('notifications response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);

    const notifications = body?.data?.notifications || [];

    const unreadNotification = notifications
      .filter((notification: any) => notification.is_read === false)
      .sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )[0];

    if (!unreadNotification) {
      test.skip(true, 'No unread notifications found to exercise mark-as-read flow');
    }

    const publicId = unreadNotification.public_id;
    expect(publicId).toBeTruthy();

    console.log('Using public_id:', publicId);

    // =========================
    // STEP 2: PATCH → 200
    // =========================
    const patchResponse = await markAsRead(
      request,
      publicId,
      {
        ...authHeaders(token),
        Accept: 'application/json',
      }
    );

    const patchBody = await parseBody(patchResponse);

    console.log(
      'mark as read response:',
      JSON.stringify(patchBody, null, 2)
    );

    expect(patchResponse.status()).toBe(200);
    expect(patchBody.message).toContain('Notification marked as read');

    // =========================
    // STEP 3: PATCH AGAIN → 400
    // =========================
    const secondPatchResponse = await markAsRead(
      request,
      publicId,
      {
        ...authHeaders(token),
        Accept: 'application/json',
      }
    );

    const secondPatchBody = await parseBody(secondPatchResponse);

    console.log(
      'already read response:',
      JSON.stringify(secondPatchBody, null, 2)
    );

    expect(secondPatchResponse.status()).toBe(400);
    expect(secondPatchBody.message).toContain(
      'Notification is already marked as read'
    );
  });

  test('TC-002 Get notifications without token → 401', async ({
    request,
  }) => {
    const response = await getNotifications(
      request,
      {
        Accept: 'application/json',
      },
      DEFAULT_PARAMS
    );

    expect(response.status()).toBe(401);
  });

  test('TC-003 Get notifications with invalid token → 401', async ({
    request,
  }) => {
    const response = await getNotifications(
      request,
      {
        Authorization: `Bearer ${INVALID_TOKEN}`,
        Accept: 'application/json',
      },
      DEFAULT_PARAMS
    );

    expect(response.status()).toBe(401);
  });

  test('TC-004 Invalid page parameter → 422', async ({ request }) => {
    const token = requireToken();

    const response = await getNotifications(
      request,
      {
        ...authHeaders(token),
        Accept: 'application/json',
      },
      {
        page: 'abc',
        per_page: 20,
      }
    );

    expect(response.status()).toBe(422);
  });

  test('TC-005 Invalid per_page parameter → 422', async ({ request }) => {
    const token = requireToken();

    const response = await getNotifications(
      request,
      {
        ...authHeaders(token),
        Accept: 'application/json',
      },
      {
        page: 1,
        per_page: 'abc',
      }
    );

    expect(response.status()).toBe(422);
  });

  test('TC-006 Notifications API with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/notifications'
      );
    }).rejects.toThrow();
  });

  test('TC-007 Notifications API with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await getNotifications(
        request,
        {
          ...authHeaders(token),
          Accept: 'application/json',
        },
        DEFAULT_PARAMS,
        `${BASE_URL}${NOTIFICATIONS_ENDPOINT}`,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});