import { test, expect } from '@playwright/test';
import { INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

test.describe('Open Attendance API', () => {
  const ENDPOINT = '/api/attendances/open';

  test('TC-001 Get open attendance with valid token returns 200 success', async ({ request }) => {
    const token = requireToken();

    const response = await request.get(ENDPOINT, {
      headers: authHeaders(token),
    });

    const body = await parseBody(response);
    console.log('open attendance response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body).toBeTruthy();

    if (typeof body.success !== 'undefined') {
      expect(body.success).toBe(true);
    }

    if (typeof body.status_code !== 'undefined') {
      expect(body.status_code).toBe(200);
    }

    expect(body.data).toBeTruthy();
  });

  test('TC-002 Get open attendance with invalid token returns 401 error', async ({ request }) => {
    const response = await request.get(ENDPOINT, {
      headers: authHeaders(INVALID_TOKEN),
    });

    const body = await parseBody(response);
    console.log('open attendance invalid token response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
    expect(body.error || body.message || body.reason).toBeTruthy();
  });
});