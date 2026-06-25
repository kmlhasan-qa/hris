import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const ENDPOINT = '/api/profile/avatar';

test('TC-001 Delete avatar with valid token returns 200', async ({ request }) => {
  const token = requireToken();

  const response = await request.delete(`${BASE_URL}${ENDPOINT}`, {
    headers: {
      ...authHeaders(token, false),
      Accept: 'application/json',
    },
  });

  const body = await parseBody(response);
  console.log('delete avatar response:', JSON.stringify(body, null, 2));

  expect(response.status(), 'expected 200 OK').toBe(200);
  expect(body).toBeTruthy();

  if (typeof body.success !== 'undefined') {
    expect(body.success).toBe(true);
  }
});

test('TC-002 Delete avatar with invalid token returns 401', async ({ request }) => {
  const response = await request.delete(`${BASE_URL}${ENDPOINT}`, {
    headers: {
      ...authHeaders(INVALID_TOKEN, false),
      Accept: 'application/json',
    },
  });

  const body = await parseBody(response);
  console.log('delete avatar invalid token response:', JSON.stringify(body, null, 2));

  expect(response.status(), 'expected 401 Unauthorized').toBe(401);
});