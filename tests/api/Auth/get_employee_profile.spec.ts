import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, requireToken, assertSuccessOrError } from '../_shared';

test('TC-001 Get employee profile with valid final token returns 200', async ({ request }) => {
  const token = requireToken();
  const response = await request.get(`${BASE_URL}/api/auth/profile`, { headers: authHeaders(token) });

  expect(response.status()).toBe(200);
  const body = await assertSuccessOrError(response);
  console.log('employee profile response body:', body);
});

test('TC-002 Get employee profile with invalid token returns 401', async ({ request }) => {
  const response = await request.get(`${BASE_URL}/api/auth/profile`, { headers: authHeaders(INVALID_TOKEN) });

  expect(response.status()).toBe(401);
});
