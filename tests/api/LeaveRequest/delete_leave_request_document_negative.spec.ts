import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const DELETE_DOCUMENT_ENDPOINT = '/api/leave-requests';
const REQUEST_TIMEOUT = 10;

const VALID_LEAVE_REQUEST_ID = Number(process.env.LEAVE_REQUEST_ID ?? 1);
const NON_PENDING_LEAVE_REQUEST_ID = Number(
  process.env.NON_PENDING_LEAVE_REQUEST_ID ?? 9
);
const INVALID_LEAVE_REQUEST_ID = 999999;

test.describe('Delete Leave Request Document API - Negative Scenarios', () => {
  const deleteLeaveDocument = (
    request: APIRequestContext,
    leaveRequestId: number,
    headers: Record<string, string>,
    endpoint?: string,
    options?: { timeout?: number }
  ) =>
    request.delete(
      endpoint ??
        `${BASE_URL}${DELETE_DOCUMENT_ENDPOINT}/${leaveRequestId}/document`,
      {
        headers,
        ...options,
      }
    );

  test('TC-NEG-001 Delete document without token → 401', async ({
    request,
  }) => {
    const response = await deleteLeaveDocument(
      request,
      VALID_LEAVE_REQUEST_ID,
      {
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);
    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-002 Delete document with invalid token → 401', async ({
    request,
  }) => {
    const response = await deleteLeaveDocument(
      request,
      VALID_LEAVE_REQUEST_ID,
      {
        Authorization: `Bearer ${INVALID_TOKEN}`,
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);
    console.log('401 invalid token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-003 Delete document from non-pending leave request → 403', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await deleteLeaveDocument(
      request,
      NON_PENDING_LEAVE_REQUEST_ID,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);
    console.log('403 forbidden:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(403);
  });

  test('TC-NEG-004 Delete document from non-existing leave request → 404', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await deleteLeaveDocument(
      request,
      INVALID_LEAVE_REQUEST_ID,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);
    console.log('404 not found:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(404);
  });

  test('TC-NEG-005 Delete document with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.delete(
        'https://invalid-domain-for-testing-12345.com/api/leave-requests/1/document'
      );
    }).rejects.toThrow();
  });

  test('TC-NEG-006 Delete document with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await deleteLeaveDocument(
        request,
        VALID_LEAVE_REQUEST_ID,
        {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
        undefined,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});