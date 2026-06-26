import { test, expect } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const ENDPOINT = '/api/account-deletion-requests';
const REQUEST_TIMEOUT = 10;

test.describe('Account Deletion Request API', () => {
  async function submitDeletionRequest(
    request: import('@playwright/test').APIRequestContext,
    headers: Record<string, string>
  ) {
    const response = await request.post(`${BASE_URL}${ENDPOINT}`, {
      headers,
    });

    const body = await parseBody(response);

    return { response, body };
  }

  test('TC-001 Request account deletion with valid token → 200 or 409', async ({
    request,
  }) => {
    const token = requireToken();

    const { response, body } = await submitDeletionRequest(
      request,
      authHeaders(token)
    );

    console.log(
      'account deletion response:',
      JSON.stringify(body, null, 2)
    );

    expect([200, 409]).toContain(response.status());
    expect(body).toBeTruthy();

    if (response.status() === 200) {
      expect(body.success).toBe(true);
    }

    if (response.status() === 409) {
      expect(body.success).toBe(false);
      expect(body.message || body.error).toMatch(
        /pending account deletion request/i
      );
    }
  });

  test('TC-002 Request account deletion with invalid token → 401', async ({
    request,
  }) => {
    const { response, body } = await submitDeletionRequest(
      request,
      authHeaders(INVALID_TOKEN)
    );

    console.log(
      'account deletion invalid token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(401);
  });

  test('TC-003 Request account deletion without token → 401', async ({
    request,
  }) => {
    const { response, body } = await submitDeletionRequest(request, {
      Accept: 'application/json',
    });

    console.log(
      'account deletion without token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(401);
  });

  test('TC-004 Request account deletion with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.post(
        'https://invalid-domain-for-testing-12345.com/api/account-deletion-requests'
      );
    }).rejects.toThrow();
  });

  test('TC-005 Request account deletion with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();
    if (!token) {
      console.log('Skipping test: token unavailable');
      return;
    }

    await expect(async () => {
      await request.post(`${BASE_URL}${ENDPOINT}`, {
        headers: authHeaders(token),
        timeout: REQUEST_TIMEOUT,
      });
    }).rejects.toThrow();
  });
});