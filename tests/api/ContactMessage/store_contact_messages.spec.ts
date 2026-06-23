import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const ENDPOINT = '/api/contact-messages';

const VALID_PAYLOAD = {
  subject_id: 1,
  department_id: 41,
  message: 'automation playwright',
};

test('TC-001 Submit contact message with valid token returns 201', async ({ request }) => {
  const token = requireToken();
  const response = await request.post(`${BASE_URL}${ENDPOINT}`, {
    headers: authHeaders(token, true),
    data: VALID_PAYLOAD,
  });

  const body = await parseBody(response);
  console.log('contact message response body:', JSON.stringify(body, null, 2));

  expect(response.status(), 'expected 201 Created').toBe(201);
  expect(body).toBeTruthy();
  if (typeof body.success !== 'undefined') expect(body.success).toBe(true);
  expect(body.message || body.data || body).toBeTruthy();
});

test('TC-002 Submit contact message with invalid token returns 401 unauthorized', async ({ request }) => {
  const response = await request.post(`${BASE_URL}${ENDPOINT}`, {
    headers: authHeaders(INVALID_TOKEN, true),
    data: VALID_PAYLOAD,
  });

  console.log('contact message invalid token response:', JSON.stringify(await parseBody(response), null, 2));
  expect(response.status(), 'expected 401 Unauthorized').toBe(401);
});

test('TC-003 Submit contact message with missing required fields returns 422 validation error', async ({ request }) => {
  const token = requireToken();
  const response = await request.post(`${BASE_URL}${ENDPOINT}`, {
    headers: authHeaders(token, true),
    data: {},
  });

  const body = await parseBody(response);
  console.log('contact message validation error response:', JSON.stringify(body, null, 2));

  expect(response.status(), 'expected 422 Unprocessable Entity').toBe(422);
  expect(body.message || body.errors || body.error).toBeTruthy();
});
