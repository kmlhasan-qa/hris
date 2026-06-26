import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const ENDPOINT = '/api/leave-types';
const REQUEST_TIMEOUT = 10;

test.describe('Get Leave Types API', () => {
  const getLeaveTypes = (
    request: APIRequestContext,
    headers: Record<string, string>,
    endpoint: string = `${BASE_URL}${ENDPOINT}`,
    options?: { timeout?: number }
  ) =>
    request.get(endpoint, {
      headers,
      ...options,
    });

  test('TC-001 Get leave types with valid token returns 200', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await getLeaveTypes(request, {
      ...authHeaders(token, false),
      Accept: 'application/json',
    });

    const body = await parseBody(response);

    console.log(
      'get leave types response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status(), 'expected 200 OK').toBe(200);
    expect(body).toBeTruthy();

    if (Array.isArray(body)) {
      expect(body.length).toBeGreaterThan(0);
    }

    if (body?.data && Array.isArray(body.data)) {
      expect(body.data.length).toBeGreaterThan(0);
    }
  });

  test('TC-002 Get leave types with invalid token returns 401', async ({
    request,
  }) => {
    const response = await getLeaveTypes(request, {
      ...authHeaders(INVALID_TOKEN, false),
      Accept: 'application/json',
    });

    const body = await parseBody(response);

    console.log(
      'get leave types invalid token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status(), 'expected 401 Unauthorized').toBe(401);

    if (body?.message) {
      expect(body.message).toContain('Unauthenticated');
    }
  });

  test('TC-003 Get leave types without token returns 401', async ({
    request,
  }) => {
    const response = await getLeaveTypes(request, {
      Accept: 'application/json',
    });

    const body = await parseBody(response);

    console.log(
      'get leave types without token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(401);
  });

  test('TC-004 Get leave types with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/leave-types'
      );
    }).rejects.toThrow();
  });

  test('TC-005 Get leave types with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await getLeaveTypes(
        request,
        {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
        `${BASE_URL}${ENDPOINT}`,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});