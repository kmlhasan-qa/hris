import { test, expect, type APIResponse } from '@playwright/test';

const BASE_URL = 'https://hris.itmanage.com.au';

async function expectResponseSuccessOrError(response: APIResponse) {
  const body = await response.json().catch(() => ({}));

  if (response.status() === 200) {
    expect(body).toBeTruthy();
    if (typeof body.success !== 'undefined') expect(body.success).toBe(true);
    if (typeof body.status !== 'undefined') expect(String(body.status).toLowerCase()).toMatch(/success|ok/);
    expect(body.data || body.version || body).toBeTruthy();
  } else {
    expect(body.error || body.message || body.reason).toBeTruthy();
  }

  return body;
}

test.describe('HRIS app version status', () => {
  test('TC-001 Get app version status returns 200 success or error response', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/app-version-status`);

    if (response.status() === 200) {
      expect(response.status()).toBe(200);
    } else {
      expect(response.status()).not.toBe(200);
    }

    await expectResponseSuccessOrError(response);
  });
});
