import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const CANCEL_ENDPOINT = '/api/leave-requests';
const REQUEST_TIMEOUT = 10;

// Replace with real IDs from your environment
const VALID_CANCELLABLE_LEAVE_ID = 236;
const NON_CANCELLABLE_LEAVE_ID = 9;
const INVALID_LEAVE_ID = 999999;

const VALID_PAYLOAD = {
  cancellation_reason: 'Automation cancellation',
};

test.describe('Cancel Leave Request API - Negative Scenarios', () => {
  const cancelLeave = (
    request: APIRequestContext,
    leaveId: number,
    headers: Record<string, string>,
    data: Record<string, any>,
    endpoint?: string,
    options?: { timeout?: number }
  ) =>
    request.post(
      endpoint ?? `${BASE_URL}${CANCEL_ENDPOINT}/${leaveId}/cancel`,
      {
        headers,
        data,
        ...options,
      }
    );

  test('TC-NEG-001 Cancel leave request without token → 401', async ({
    request,
  }) => {
    const response = await cancelLeave(
      request,
      VALID_CANCELLABLE_LEAVE_ID,
      {
        Accept: 'application/json',
      },
      {
        cancellation_reason: 'Unauthorized cancel',
      }
    );

    const body = await parseBody(response);
    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-002 Cancel leave request with invalid token → 401', async ({
    request,
  }) => {
    const response = await cancelLeave(
      request,
      VALID_CANCELLABLE_LEAVE_ID,
      {
        Authorization: `Bearer ${INVALID_TOKEN}`,
        Accept: 'application/json',
      },
      {
        cancellation_reason: 'Invalid token cancel',
      }
    );

    const body = await parseBody(response);
    console.log('401 invalid token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-003 Cancel non-future leave request → 403', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await cancelLeave(
      request,
      NON_CANCELLABLE_LEAVE_ID,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      {
        cancellation_reason: 'Forbidden cancel',
      }
    );

    const body = await parseBody(response);
    console.log('403 forbidden:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(403);
  });

  test('TC-NEG-004 Cancel non-existing leave request → 404', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await cancelLeave(
      request,
      INVALID_LEAVE_ID,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      {
        cancellation_reason: 'Not found cancel',
      }
    );

    const body = await parseBody(response);
    console.log('404 not found:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(404);
  });

  test('TC-NEG-005 Cancel leave request with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.post(
        'https://invalid-domain-for-testing-12345.com/api/leave-requests/236/cancel'
      );
    }).rejects.toThrow();
  });

  test('TC-NEG-006 Cancel leave request with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await cancelLeave(
        request,
        VALID_CANCELLABLE_LEAVE_ID,
        {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
        VALID_PAYLOAD,
        undefined,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});