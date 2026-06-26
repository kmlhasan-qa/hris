import { test, expect } from '@playwright/test';
import { BASE_URL, parseBody } from '../_shared';

const TENANT_VERIFY_ENDPOINT = '/api/tenants/verify';

test.describe('Tenant Verify API', () => {
  test('TC-001 Verify active tenant (ict) → 200', async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}${TENANT_VERIFY_ENDPOINT}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: {
          tenant_id: 'ict',
        },
      }
    );

    const body = await parseBody(response);

    console.log('tenant ict response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Tenant verified successfully');
  });

  test('TC-002 Verify inactive tenant (temp) → 403', async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}${TENANT_VERIFY_ENDPOINT}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: {
          tenant_id: 'temp',
        },
      }
    );

    const body = await parseBody(response);

    console.log('tenant temp response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(403);
    expect(body.success).toBe(false);
    expect(body.message).toContain('Tenant environment is inactive');
  });

  test('TC-003 Verify non-existing tenant (abcd) → 404', async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}${TENANT_VERIFY_ENDPOINT}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: {
          tenant_id: 'abcd',
        },
      }
    );

    const body = await parseBody(response);

    console.log('tenant abcd response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(404);
    expect(body.success).toBe(false);
    expect(body.message).toContain('Invalid Tenant ID');
  });

  test('TC-004 Missing tenant_id → 422', async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}${TENANT_VERIFY_ENDPOINT}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: {},
      }
    );

    const body = await parseBody(response);

    console.log('missing tenant_id response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
    expect(body.success).toBe(false);
  });

  test('TC-005 Empty tenant_id → 422', async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}${TENANT_VERIFY_ENDPOINT}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: {
          tenant_id: '',
        },
      }
    );

    const body = await parseBody(response);

    console.log('empty tenant_id response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
    expect(body.success).toBe(false);
  });
});