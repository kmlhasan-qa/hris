import { test, expect } from '@playwright/test';
import { assertSuccessOrError } from '../_shared';

test.describe('App Version Status API', () => {
  const ENDPOINT = '/api/app-version-status';
  const REQUEST_TIMEOUT = 10;

  test('TC-001 Get app version status returns success response', async ({ request }) => {
    const response = await request.get(ENDPOINT);
    await assertSuccessOrError(response);
  });

  test('TC-002 Failed to fetch when server is unreachable', async ({ request }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/app-version-status'
      );
    }).rejects.toThrow();
  });

  test('TC-003 Failed to fetch due to timeout', async ({ request }) => {
    await expect(async () => {
      await request.get(ENDPOINT, {
        timeout: REQUEST_TIMEOUT,
      });
    }).rejects.toThrow();
  });
});