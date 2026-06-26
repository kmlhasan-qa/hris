import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const SUBJECTS_ENDPOINT = '/api/subjects';

test.describe('Subjects API', () => {
  test('TC-001 Get subjects with valid token → 200', async ({ request }) => {
    const token = requireToken();
    if (!token) {
      console.log('Skipping test: token unavailable');
      return;
    }

    const response = await request.get(
      `${BASE_URL}${SUBJECTS_ENDPOINT}`,
      {
        headers: {
          ...authHeaders(token),
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);

    console.log('subjects response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Subjects retrieved successfully');
  });

  test('TC-002 Get subjects without token → 401', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${SUBJECTS_ENDPOINT}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);

    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-003 Get subjects with invalid token → 401', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${SUBJECTS_ENDPOINT}`,
      {
        headers: {
          Authorization: `Bearer ${INVALID_TOKEN}`,
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);

    console.log('401 invalid token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });
});