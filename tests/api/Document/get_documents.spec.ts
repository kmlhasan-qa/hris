import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const ENDPOINT = '/api/documents';

const VALID_PARAMS = {
  page: 1,
  per_page: 20,
};

test('TC-001 Get documents with valid token returns 200', async ({ request }) => {
  const token = requireToken();

  const response = await request.get(`${BASE_URL}${ENDPOINT}`, {
    headers: authHeaders(token, true),
    params: VALID_PARAMS,
  });

  const body = await parseBody(response);
  console.log('documents response body:', JSON.stringify(body, null, 2));

  expect(response.status(), 'expected 200 OK').toBe(200);
  expect(body).toBeTruthy();

  if (typeof body.success !== 'undefined') {
    expect(body.success).toBe(true);
  }

  expect(body.data || body.documents || body).toBeTruthy();
});

test('TC-002 Get documents with invalid token returns 401 unauthorized', async ({ request }) => {
  const response = await request.get(`${BASE_URL}${ENDPOINT}`, {
    headers: authHeaders(INVALID_TOKEN, true),
    params: VALID_PARAMS,
  });

  const body = await parseBody(response);
  console.log('documents invalid token response:', JSON.stringify(body, null, 2));

  expect(response.status(), 'expected 401 Unauthorized').toBe(401);
});

test('TC-003 Get documents with invalid params returns 422 validation error', async ({ request }) => {
  const token = requireToken();

  const response = await request.get(`${BASE_URL}${ENDPOINT}`, {
    headers: authHeaders(token, true),
    params: {
      page: '',       // invalid
      per_page: '',   // invalid
    },
  });

  const body = await parseBody(response);
  console.log('documents validation error response:', JSON.stringify(body, null, 2));

  expect(response.status(), 'expected 422 Unprocessable Entity').toBe(422);
  expect(body.message || body.errors || body.error).toBeTruthy();
});