import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  INVALID_TOKEN,
  authHeaders,
  requireToken,
  assertSuccessOrError,
} from '../_shared';

test.describe('Employee Profile API', () => {
  const ENDPOINT = '/api/auth/profile';
  const REQUEST_TIMEOUT = 10;

  async function getEmployeeProfile(
    request: APIRequestContext,
    headers: Record<string, string>,
    endpoint: string = ENDPOINT,
    options?: { timeout?: number }
  ) {
    return request.get(endpoint, {
      headers,
      ...options,
    });
  }

  test('TC-001 Get employee profile with valid token returns 200', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await getEmployeeProfile(
      request,
      authHeaders(token)
    );

    expect(response.status()).toBe(200);

    const body = await assertSuccessOrError(response);
    console.log('employee profile response:', body);
  });

  test('TC-002 Get employee profile with invalid token returns 401', async ({
    request,
  }) => {
    const response = await getEmployeeProfile(
      request,
      authHeaders(INVALID_TOKEN)
    );

    expect(response.status()).toBe(401);
  });

  test('TC-003 Get employee profile without token returns 401', async ({
    request,
  }) => {
    const response = await getEmployeeProfile(request, {
      Accept: 'application/json',
    });

    expect(response.status()).toBe(401);
  });

  test('TC-004 Get employee profile with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/auth/profile'
      );
    }).rejects.toThrow();
  });

  test('TC-005 Get employee profile with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await getEmployeeProfile(
        request,
        authHeaders(token),
        ENDPOINT,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});