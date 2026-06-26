import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const UPDATE_ENDPOINT = '/api/leave-requests';
const today = new Date().toISOString().split('T')[0];

test.describe('Update Leave History API - Negative Scenarios', () => {
  test('TC-NEG-001 Update leave request without token → 401', async ({ request }) => {
    const response = await request.post(`${BASE_URL}${UPDATE_ENDPOINT}/1/update`, {
      headers: {
        Accept: 'application/json',
      },
      data: {
        leave_type_id: 4,
        start_date: today,
        end_date: today,
        reason: 'Unauthorized update',
      },
    });

    const body = await parseBody(response);
    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-002 Update leave request with invalid token → 401', async ({ request }) => {
    const response = await request.post(`${BASE_URL}${UPDATE_ENDPOINT}/1/update`, {
      headers: {
        Authorization: `Bearer ${INVALID_TOKEN}`,
        Accept: 'application/json',
      },
      data: {
        leave_type_id: 4,
        start_date: today,
        end_date: today,
        reason: 'Invalid token update',
      },
    });

    const body = await parseBody(response);
    console.log('401 invalid token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-003 Update non-pending leave request → 403', async ({ request }) => {
    const token = requireToken();

    const response = await request.post(`${BASE_URL}${UPDATE_ENDPOINT}/${process.env.NON_PENDING_LEAVE_REQUEST_ID ?? 9}/update`, {
      headers: {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      data: {
        leave_type_id: 4,
        start_date: today,
        end_date: today,
        reason: 'Forbidden update',
      },
    });

    const body = await parseBody(response);
    console.log('403 forbidden:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(403);
  });

  test('TC-NEG-004 Update non-existing leave request → 404', async ({ request }) => {
    const token = requireToken();

    const response = await request.post(`${BASE_URL}${UPDATE_ENDPOINT}/999999/update`, {
      headers: {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      data: {
        leave_type_id: 4,
        start_date: today,
        end_date: today,
        reason: 'Not found test',
      },
    });

    const body = await parseBody(response);
    console.log('404 not found:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(404);
  });

  test('TC-NEG-005 Missing required fields → 422', async ({ request }) => {
    const token = requireToken();

    const response = await request.post(`${BASE_URL}${UPDATE_ENDPOINT}/${process.env.LEAVE_REQUEST_ID ?? 1}/update`, {
      headers: {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      data: {
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
      },
    });

    const body = await parseBody(response);
    console.log('422 validation error:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
  });
});