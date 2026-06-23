import { test } from '@playwright/test';
import { BASE_URL, assertSuccessOrError } from '../_shared';

test('TC-001 Get app version status returns 200 success or error response', async ({ request }) => {
  const response = await request.get(`${BASE_URL}/api/app-version-status`);
  await assertSuccessOrError(response);
});
