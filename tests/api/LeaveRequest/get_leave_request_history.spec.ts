import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const ENDPOINT = '/api/leave-requests';

test('TC-001 Get leave requests historywith valid token returns 200', async ({ request }) => {
  const token = requireToken();

  const response = await request.get(`${BASE_URL}${ENDPOINT}`, {
    headers: {
      ...authHeaders(token, false),
      Accept: 'application/json',
    },
    params: {
      page: 1,
      per_page: 20
    },
  });

  const body = await parseBody(response);

  console.log(
    'get leave requests response:',
    JSON.stringify(body, null, 2)
  );

  expect(response.status(), 'expected 200 OK').toBe(200);
  expect(body).toBeTruthy();
});

test('TC-002 Get leave requests history with invalid token returns 401', async ({ request }) => {
  const response = await request.get(`${BASE_URL}${ENDPOINT}`, {
    headers: {
      ...authHeaders(INVALID_TOKEN, false),
      Accept: 'application/json',
    },
    params: {
      page: 1,
      per_page: 20,
      status: 'pending',
    },
  });

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