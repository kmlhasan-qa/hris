import { test, expect, type APIRequestContext } from '@playwright/test';
import { BASE_URL, parseBody } from '../_shared';

const TENANT_VERIFY_ENDPOINT = '/api/tenants/verify';
const REQUEST_TIMEOUT = 10;

const ACTIVE_TENANT = { tenant_id: 'ict' };
const INACTIVE_TENANT = { tenant_id: 'temp' };
const INVALID_TENANT = { tenant_id: 'abcd' };

test.describe('Tenant Verify API', () => {
  const verifyTenant = (
    request: APIRequestContext,
    data: Record<string, any>,
    endpoint: string = `${BASE_URL}${TENANT_VERIFY_ENDPOINT}`,
    options?: { timeout?: number }
  ) =>
    request.post(endpoint, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data,
      ...options,
    });

  test('TC-001 Verify active tenant (ict) → 200', async ({ request }) => {
    const response = await verifyTenant(request, ACTIVE_TENANT);
    const body = await parseBody(response);

    console.log('tenant ict response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Tenant verified successfully');
  });

  test('TC-002 Verify inactive tenant (temp) → 403', async ({ request }) => {
    const response = await verifyTenant(request, INACTIVE_TENANT);
    const body = await parseBody(response);

    console.log('tenant temp response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(403);
    expect(body.success).toBe(false);
    expect(body.message).toContain('Tenant environment is inactive');
  });

  test('TC-003 Verify non-existing tenant (abcd) → 404', async ({
    request,
  }) => {
    const response = await verifyTenant(request, INVALID_TENANT);
    const body = await parseBody(response);

    console.log('tenant abcd response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(404);
    expect(body.success).toBe(false);
    expect(body.message).toContain('Invalid Tenant ID');
  });

  test('TC-004 Missing tenant_id → 422', async ({ request }) => {
    const response = await verifyTenant(request, {});
    const body = await parseBody(response);

    console.log('missing tenant_id response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
    expect(body.success).toBe(false);
  });

  test('TC-005 Empty tenant_id → 422', async ({ request }) => {
    const response = await verifyTenant(request, {
      tenant_id: '',
    });

    const body = await parseBody(response);

    console.log('empty tenant_id response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
    expect(body.success).toBe(false);
  });

  test('TC-006 Verify tenant with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.post(
        'https://invalid-domain-for-testing-12345.com/api/tenants/verify'
      );
    }).rejects.toThrow();
  });

  test('TC-007 Verify tenant with forced timeout → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await verifyTenant(
        request,
        ACTIVE_TENANT,
        `${BASE_URL}${TENANT_VERIFY_ENDPOINT}`,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});