import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const ENDPOINT = '/api/profile/avatar';
const REQUEST_TIMEOUT = 10;

test.describe('Delete Avatar API', () => {
  const deleteAvatar = (
    request: APIRequestContext,
    headers: Record<string, string>,
    endpoint: string = `${BASE_URL}${ENDPOINT}`,
    options?: { timeout?: number }
  ) =>
    request.delete(endpoint, {
      headers,
      ...options,
    });

  test('TC-001 Delete avatar with valid token returns 200', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await deleteAvatar(
      request,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);
    console.log('delete avatar response:', JSON.stringify(body, null, 2));

    expect(response.status(), 'expected 200 OK').toBe(200);
    expect(body).toBeTruthy();

    if (typeof body.success !== 'undefined') {
      expect(body.success).toBe(true);
    }
  });

  test('TC-002 Delete avatar with invalid token returns 401', async ({
    request,
  }) => {
    const response = await deleteAvatar(
      request,
      {
        ...authHeaders(INVALID_TOKEN, false),
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);
    console.log(
      'delete avatar invalid token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status(), 'expected 401 Unauthorized').toBe(401);
  });

  test('TC-003 Delete avatar without token returns 401', async ({
    request,
  }) => {
    const response = await deleteAvatar(
      request,
      {
        Accept: 'application/json',
      }
    );

    const body = await parseBody(response);
    console.log(
      'delete avatar without token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(401);
  });

  test('TC-004 Delete avatar with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.delete(
        'https://invalid-domain-for-testing-12345.com/api/profile/avatar'
      );
    }).rejects.toThrow();
  });

  test('TC-005 Delete avatar with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await deleteAvatar(
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