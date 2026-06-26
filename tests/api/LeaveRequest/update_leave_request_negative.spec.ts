import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const UPDATE_ENDPOINT = '/api/leave-requests';
const REQUEST_TIMEOUT = 10;
const today = new Date().toISOString().split('T')[0];

const VALID_LEAVE_REQUEST_ID = Number(process.env.LEAVE_REQUEST_ID ?? 1);
const NON_PENDING_LEAVE_REQUEST_ID = Number(
  process.env.NON_PENDING_LEAVE_REQUEST_ID ?? 9
);
const INVALID_LEAVE_REQUEST_ID = 999999;

const VALID_PAYLOAD = {
  leave_type_id: 4,
  start_date: today,
  end_date: today,
  reason: 'Automation update',
};

test.describe('Update Leave History API - Negative Scenarios', () => {
  const updateLeaveRequest = (
    request: APIRequestContext,
    leaveRequestId: number,
    headers: Record<string, string>,
    data: Record<string, any>,
    endpoint?: string,
    options?: { timeout?: number }
  ) =>
    request.post(
      endpoint ??
        `${BASE_URL}${UPDATE_ENDPOINT}/${leaveRequestId}/update`,
      {
        headers,
        data,
        ...options,
      }
    );

  test('TC-NEG-001 Update leave request without token → 401', async ({
    request,
  }) => {
    const response = await updateLeaveRequest(
      request,
      VALID_LEAVE_REQUEST_ID,
      {
        Accept: 'application/json',
      },
      {
        ...VALID_PAYLOAD,
        reason: 'Unauthorized update',
      }
    );

    const body = await parseBody(response);
    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-002 Update leave request with invalid token → 401', async ({
    request,
  }) => {
    const response = await updateLeaveRequest(
      request,
      VALID_LEAVE_REQUEST_ID,
      {
        Authorization: `Bearer ${INVALID_TOKEN}`,
        Accept: 'application/json',
      },
      {
        ...VALID_PAYLOAD,
        reason: 'Invalid token update',
      }
    );

    const body = await parseBody(response);
    console.log('401 invalid token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-003 Update non-pending leave request → 403', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await updateLeaveRequest(
      request,
      NON_PENDING_LEAVE_REQUEST_ID,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      {
        ...VALID_PAYLOAD,
        reason: 'Forbidden update',
      }
    );

    const body = await parseBody(response);
    console.log('403 forbidden:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(403);
  });

  test('TC-NEG-004 Update non-existing leave request → 404', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await updateLeaveRequest(
      request,
      INVALID_LEAVE_REQUEST_ID,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      {
        ...VALID_PAYLOAD,
        reason: 'Not found test',
      }
    );

    const body = await parseBody(response);
    console.log('404 not found:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(404);
  });

  test('TC-NEG-005 Missing required fields → 422', async ({ request }) => {
    const token = requireToken();

    const response = await updateLeaveRequest(
      request,
      VALID_LEAVE_REQUEST_ID,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      {
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
      }
    );

    const body = await parseBody(response);
    console.log('422 validation error:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
  });

  test('TC-NEG-006 Update leave request with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.post(
        'https://invalid-domain-for-testing-12345.com/api/leave-requests/1/update'
      );
    }).rejects.toThrow();
  });

  test('TC-NEG-007 Update leave request with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await updateLeaveRequest(
        request,
        VALID_LEAVE_REQUEST_ID,
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