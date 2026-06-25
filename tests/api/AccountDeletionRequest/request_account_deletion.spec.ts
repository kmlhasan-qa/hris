import { test, expect } from '@playwright/test';
import { INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

test.describe('Account Deletion Request API', () => {
  const ENDPOINT = '/api/account-deletion-requests';

  test('TC-001 Request account deletion with valid token returns 200 or 409', async ({ request }) => {
    const token = requireToken();

    const response = await request.post(ENDPOINT, {
      headers: authHeaders(token),
    });

    const body = await parseBody(response);
    console.log('account deletion response:', JSON.stringify(body, null, 2));

    expect([200, 409]).toContain(response.status());
    expect(body).toBeTruthy();
    expect(body.data || body.user || body).toBeTruthy();

    if (response.status() === 409) {
      expect(body.message || body.error).toMatch(/pending account deletion request/i);
    }
  });

  test('TC-002 Request account deletion with invalid token returns 401', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      headers: authHeaders(INVALID_TOKEN),
    });

    const body = await parseBody(response);
    console.log('account deletion invalid token response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });
});