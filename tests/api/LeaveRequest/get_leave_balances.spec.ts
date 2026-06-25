import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const ENDPOINT = '/api/leave-balances';

test('TC-001 Get leave balances with valid token returns 200', async ({ request }) => {
  const token = requireToken();

  const response = await request.get(`${BASE_URL}${ENDPOINT}`, {
    headers: {
      ...authHeaders(token, false),
      Accept: 'application/json',
    },
  });

  const body = await parseBody(response);

  console.log(
    'get leave balances response:',
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

test('TC-002 Get leave balances with invalid token returns 401', async ({ request }) => {
  const response = await request.get(`${BASE_URL}${ENDPOINT}`, {
    headers: {
      ...authHeaders(INVALID_TOKEN, false),
      Accept: 'application/json',
    },
  });

  const body = await parseBody(response);

  console.log(
    'get leave balances invalid token response:',
    JSON.stringify(body, null, 2)
  );

  expect(response.status(), 'expected 401 Unauthorized').toBe(401);

  if (body?.message) {
    expect(body.message).toContain('Unauthenticated');
  }
});