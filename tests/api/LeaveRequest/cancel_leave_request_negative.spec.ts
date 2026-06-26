import { test, expect } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const CANCEL_ENDPOINT = '/api/leave-requests';

// Replace with real IDs from your environment
const VALID_CANCELLABLE_LEAVE_ID = 236; // existing + future leave
const NON_CANCELLABLE_LEAVE_ID = 9; // existing + non-future leave
const INVALID_LEAVE_ID = 999999;

test.describe('Cancel Leave Request API - Negative Scenarios', () => {
  test('TC-NEG-001 Cancel leave request without token → 401', async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}${CANCEL_ENDPOINT}/${VALID_CANCELLABLE_LEAVE_ID}/cancel`,
      {
        headers: {
          Accept: 'application/json',
        },
        data: {
          cancellation_reason: 'Unauthorized cancel',
        },
      }
    );

    const body = await parseBody(response);
    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-002 Cancel leave request with invalid token → 401', async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}${CANCEL_ENDPOINT}/${VALID_CANCELLABLE_LEAVE_ID}/cancel`,
      {
        headers: {
          Authorization: `Bearer ${INVALID_TOKEN}`,
          Accept: 'application/json',
        },
        data: {
          cancellation_reason: 'Invalid token cancel',
        },
      }
    );

    const body = await parseBody(response);
    console.log('401 invalid token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-003 Cancel non-future leave request → 403', async ({ request }) => {
    const token = requireToken();

    const response = await request.post(
      `${BASE_URL}${CANCEL_ENDPOINT}/${NON_CANCELLABLE_LEAVE_ID}/cancel`,
      {
        headers: {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
        data: {
          cancellation_reason: 'Forbidden cancel',
        },
      }
    );

    const body = await parseBody(response);
    console.log('403 forbidden:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(403);
  });

  test('TC-NEG-004 Cancel non-existing leave request → 404', async ({ request }) => {
    const token = requireToken();

    const response = await request.post(
      `${BASE_URL}${CANCEL_ENDPOINT}/${INVALID_LEAVE_ID}/cancel`,
      {
        headers: {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
        data: {
          cancellation_reason: 'Not found cancel',
        },
      }
    );

    const body = await parseBody(response);
    console.log('404 not found:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(404);
  });
});