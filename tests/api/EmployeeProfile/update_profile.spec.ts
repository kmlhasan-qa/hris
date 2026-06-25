import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const ENDPOINT = '/api/profile/update';

const VALID_PAYLOAD = {
  residential_address: 'Test Automation Playwright',
};

test('TC-001 Update profile with valid token returns 200', async ({ request }) => {
  const token = requireToken();

  const response = await request.post(`${BASE_URL}${ENDPOINT}`, {
    headers: {
      ...authHeaders(token, false),
      Accept: 'application/json',
    },
    multipart: VALID_PAYLOAD,
  });

  const body = await parseBody(response);
  console.log('profile update response:', JSON.stringify(body, null, 2));

  expect(response.status(), 'expected 200 OK').toBe(200);
  expect(body).toBeTruthy();

  if (typeof body.success !== 'undefined') {
    expect(body.success).toBe(true);
  }
});

test('TC-002 Update profile with invalid token returns 401', async ({ request }) => {
  const response = await request.post(`${BASE_URL}${ENDPOINT}`, {
    headers: {
      ...authHeaders(INVALID_TOKEN, false),
      Accept: 'application/json',
    },
    multipart: VALID_PAYLOAD,
  });

  const body = await parseBody(response);
  console.log('profile update invalid token response:', JSON.stringify(body, null, 2));

  expect(response.status(), 'expected 401 Unauthorized').toBe(401);
});

test('TC-003 Update profile with invalid emergency contact email returns 422', async ({ request }) => {
  const token = requireToken();

  const response = await request.post(`${BASE_URL}${ENDPOINT}`, {
    headers: {
      ...authHeaders(token, false),
      Accept: 'application/json',
    },
    multipart: {
      emergency_contact_email: 'wronginput',
    },
  });

  const body = await parseBody(response);
  console.log('profile update validation error response:', JSON.stringify(body, null, 2));

  expect(response.status(), 'expected 422 Unprocessable Entity').toBe(422);
  expect(body.message || body.errors || body.error).toBeTruthy();
});