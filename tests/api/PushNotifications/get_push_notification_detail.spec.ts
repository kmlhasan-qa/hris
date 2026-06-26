import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const NOTIFICATIONS_ENDPOINT = '/api/notifications';
const VALID_PUBLIC_ID = process.env.NOTIFICATION_PUBLIC_ID;

test.describe('Get Notification By Public ID API', () => {
  test.skip(!VALID_PUBLIC_ID, 'Set NOTIFICATION_PUBLIC_ID env var to an existing notification public_id');

  test('TC-001 Get notification with valid publicId → 200', async ({ request }) => {
    const token = requireToken();
    if (!token) {
      console.log('Skipping test: token unavailable');
      return;
    }

    const listResponse = await request.get(
      `${BASE_URL}${NOTIFICATIONS_ENDPOINT}?page=1&per_page=1`,
      {
        headers: {
          ...authHeaders(token),
          Accept: 'application/json',
        },
      }
    );

    expect(listResponse.status()).toBe(200);

    const listBody = await parseBody(listResponse);
    const publicId = listBody?.data?.notifications?.[0]?.public_id;
    test.skip(!publicId, 'No notifications available to fetch details for');

    const response = await request.get(
      `${BASE_URL}${NOTIFICATIONS_ENDPOINT}/${publicId}`,
      {
        headers: {
          ...authHeaders(token),
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);

    console.log(
      'notification detail response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(200);
  });

  test('TC-002 Get notification without token → 401', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${NOTIFICATIONS_ENDPOINT}/${VALID_PUBLIC_ID}`,
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

  test('TC-003 Get notification with invalid token → 401', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${NOTIFICATIONS_ENDPOINT}/${VALID_PUBLIC_ID}`,
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

  // TODO: Change expected status to 422 after backend bug is fixed
  test('TC-004 Get notification with invalid publicId → 500 (Known Bug: should be 422)', async ({ request }) => {
    const token = requireToken();
    if (!token) {
      console.log('Skipping test: token unavailable');
      return;
    }

    const response = await request.get(
      `${BASE_URL}${NOTIFICATIONS_ENDPOINT}/invalid-public-id`,
      {
        headers: {
          ...authHeaders(token),
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);

    console.log(
      '500 invalid publicId (known bug):',
      JSON.stringify(body, null, 2)
    );

    // Known backend bug:
    // Expected: 422 Validation error
    // Actual: 500 Attempt to read property "employees" on null
    expect(response.status()).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toContain('employees');
  });
});