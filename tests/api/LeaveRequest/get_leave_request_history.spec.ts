import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const ENDPOINT = '/api/leave-requests';
const REQUEST_TIMEOUT = 10;

const DEFAULT_PARAMS = {
  page: 1,
  per_page: 20,
};

test.describe('Get Leave Requests History API', () => {
  const getLeaveRequests = (
    request: APIRequestContext,
    headers: Record<string, string>,
    params: Record<string, any> = DEFAULT_PARAMS,
    endpoint: string = `${BASE_URL}${ENDPOINT}`,
    options?: { timeout?: number }
  ) =>
    request.get(endpoint, {
      headers,
      params,
      ...options,
    });

  test('TC-001 Get leave requests history with valid token returns 200', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await getLeaveRequests(
      request,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      DEFAULT_PARAMS
    );

    const body = await parseBody(response);

    console.log(
      'get leave requests response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status(), 'expected 200 OK').toBe(200);
    expect(body).toBeTruthy();
  });

  test('TC-002 Get leave requests history with invalid token returns 401', async ({
    request,
  }) => {
    const response = await getLeaveRequests(
      request,
      {
        ...authHeaders(INVALID_TOKEN, false),
        Accept: 'application/json',
      },
      {
        ...DEFAULT_PARAMS,
        status: 'pending',
      }
    );

    const body = await parseBody(response);

    console.log(
      'get leave requests invalid token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status(), 'expected 401 Unauthorized').toBe(401);

    if (body?.message) {
      expect(body.message).toContain('Unauthenticated');
    }
  });

  test('TC-003 Get leave requests history without token returns 401', async ({
    request,
  }) => {
    const response = await getLeaveRequests(
      request,
      {
        Accept: 'application/json',
      },
      DEFAULT_PARAMS
    );

    const body = await parseBody(response);

    console.log(
      'get leave requests without token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(401);
  });

  test('TC-004 Get leave requests history with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/leave-requests'
      );
    }).rejects.toThrow();
  });

  test('TC-005 Get leave requests history with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await getLeaveRequests(
        request,
        {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
        DEFAULT_PARAMS,
        `${BASE_URL}${ENDPOINT}`,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});