import { test, expect } from '@playwright/test';
import { INVALID_TOKEN, authHeaders, requireToken, assertSuccessOrError } from '../_shared';

test.describe('Employee Profile API', () => {
  const ENDPOINT = '/api/auth/profile';

  test('TC-001 Get employee profile with valid token returns 200', async ({ request }) => {
    const token = requireToken();

    const response = await request.get(ENDPOINT, {
      headers: authHeaders(token),
    });

    expect(response.status()).toBe(200);

    const body = await assertSuccessOrError(response);
    console.log('employee profile response:', body);
  });

  test('TC-002 Get employee profile with invalid token returns 401', async ({ request }) => {
    const response = await request.get(ENDPOINT, {
      headers: authHeaders(INVALID_TOKEN),
    });

    expect(response.status()).toBe(401);
  });
});