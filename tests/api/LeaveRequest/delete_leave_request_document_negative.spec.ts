import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const DELETE_DOCUMENT_ENDPOINT = '/api/leave-requests';

test.describe('Delete Leave Request Document API - Negative Scenarios', () => {
  test('TC-NEG-001 Delete document without token → 401', async ({ request }) => {
    const response = await request.delete(
      `${BASE_URL}${DELETE_DOCUMENT_ENDPOINT}/${process.env.LEAVE_REQUEST_ID ?? 1}/document`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);
    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-002 Delete document with invalid token → 401', async ({ request }) => {
    const response = await request.delete(
      `${BASE_URL}${DELETE_DOCUMENT_ENDPOINT}/${process.env.LEAVE_REQUEST_ID ?? 1}/document`,
      {
        headers: {
          Authorization: `Bearer ${INVALID_TOKEN}`,
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);
    console.log('401 invalid token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-003 Delete document from non-pending leave request → 403', async ({ request }) => {
    const token = requireToken();

    const response = await request.delete(
      `${BASE_URL}${DELETE_DOCUMENT_ENDPOINT}/9/document`,
      {
        headers: {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);
    console.log('403 forbidden:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(403);
  });

  test('TC-NEG-004 Delete document from non-existing leave request → 404', async ({ request }) => {
    const token = requireToken();

    const response = await request.delete(
      `${BASE_URL}${DELETE_DOCUMENT_ENDPOINT}/999999/document`,
      {
        headers: {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);
    console.log('404 not found:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(404);
  });
});