import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const NOTIFICATIONS_ENDPOINT = '/api/notifications';

test.describe('Notifications API', () => {
  test('TC-001 Get notifications and validate mark as read flow → 200 then 400', async ({ request }) => {
    const token = requireToken();
    if (!token) {
      console.log('Skipping test: token unavailable');
      return;
    }

    // =========================
    // STEP 1: GET NOTIFICATIONS
    // =========================
    const response = await request.get(
      `${BASE_URL}${NOTIFICATIONS_ENDPOINT}?page=1&per_page=20`,
      {
        headers: {
          ...authHeaders(token),
          Accept: 'application/json',
        },
      }
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
      console.log('No unread notifications found. Skipping PATCH request.');
      return;
    }

    const publicId = unreadNotification.public_id;

    expect(publicId).toBeTruthy();

    console.log('Using public_id:', publicId);

    // =========================
    // STEP 2: PATCH → 200
    // =========================
    const patchResponse = await request.patch(
      `${BASE_URL}${NOTIFICATIONS_ENDPOINT}/${publicId}/read`,
      {
        headers: {
          ...authHeaders(token),
          Accept: 'application/json',
        },
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
    const secondPatchResponse = await request.patch(
      `${BASE_URL}${NOTIFICATIONS_ENDPOINT}/${publicId}/read`,
      {
        headers: {
          ...authHeaders(token),
          Accept: 'application/json',
        },
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

  test('TC-002 Get notifications without token → 401', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${NOTIFICATIONS_ENDPOINT}?page=1&per_page=20`,
      {
        headers: { Accept: 'application/json' },
      }
    );

    expect(response.status()).toBe(401);
  });

  test('TC-003 Get notifications with invalid token → 401', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${NOTIFICATIONS_ENDPOINT}?page=1&per_page=20`,
      {
        headers: {
          Authorization: `Bearer ${INVALID_TOKEN}`,
          Accept: 'application/json',
        },
      }
    );

    expect(response.status()).toBe(401);
  });

  test('TC-004 Invalid page parameter → 422', async ({ request }) => {
    const token = requireToken();
    if (!token) return;

    const response = await request.get(
      `${BASE_URL}${NOTIFICATIONS_ENDPOINT}?page=abc&per_page=20`,
      {
        headers: {
          ...authHeaders(token),
          Accept: 'application/json',
        },
      }
    );

    expect(response.status()).toBe(422);
  });

  test('TC-005 Invalid per_page parameter → 422', async ({ request }) => {
    const token = requireToken();
    if (!token) return;

    const response = await request.get(
      `${BASE_URL}${NOTIFICATIONS_ENDPOINT}?page=1&per_page=abc`,
      {
        headers: {
          ...authHeaders(token),
          Accept: 'application/json',
        },
      }
    );

    expect(response.status()).toBe(422);
  });
});