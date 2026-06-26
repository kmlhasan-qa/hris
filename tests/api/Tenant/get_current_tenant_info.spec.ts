import { test, expect, type APIRequestContext } from '@playwright/test';
import { BASE_URL, parseBody } from '../_shared';

const TENANT_ENDPOINT = '/api/tenant';
const REQUEST_TIMEOUT = 10;

test.describe('Tenant API', () => {
  const getTenant = (
    request: APIRequestContext,
    endpoint: string = `${BASE_URL}${TENANT_ENDPOINT}`,
    options?: { timeout?: number }
  ) =>
    request.get(endpoint, {
      headers: {
        Accept: 'application/json',
      },
      ...options,
    });

  test('TC-001 Get tenant info successfully → 200', async ({
    request,
  }) => {
    const response = await getTenant(request);
    const body = await parseBody(response);

    console.log('tenant response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Tenant info retrieved successfully');
  });

  test('TC-002 Get tenant info with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/tenant'
      );
    }).rejects.toThrow();
  });

  test('TC-003 Get tenant info with forced timeout → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await getTenant(
        request,
        `${BASE_URL}${TENANT_ENDPOINT}`,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});