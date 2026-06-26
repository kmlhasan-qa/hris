import { test, expect } from '@playwright/test';
import { BASE_URL, parseBody } from '../_shared';

const TENANT_ENDPOINT = '/api/tenant';

test.describe('Tenant API', () => {
  test('TC-001 Get tenant info successfully → 200', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${TENANT_ENDPOINT}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);

    console.log('tenant response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Tenant info retrieved successfully');
  });
});