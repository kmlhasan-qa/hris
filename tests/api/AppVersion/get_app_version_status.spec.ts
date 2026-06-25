import { test } from '@playwright/test';
import { assertSuccessOrError } from '../_shared';

test.describe('App Version Status API', () => {
  const ENDPOINT = '/api/app-version-status';

  test('TC-001 Get app version status returns success response', async ({ request }) => {
    const response = await request.get(ENDPOINT);
    await assertSuccessOrError(response);
  });
});