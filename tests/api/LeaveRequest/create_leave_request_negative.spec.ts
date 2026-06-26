import path from 'path';
import fs from 'fs';
import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const CREATE_ENDPOINT = '/api/leave-requests';
const today = new Date().toISOString().split('T')[0];

const pdfPath = path.join(process.cwd(), 'tests/fixtures/sample.pdf');
const fileBuffer = fs.readFileSync(pdfPath);

test.describe('Leave Request API - Negative Scenarios', () => {
  test('TC-NEG-001 Create leave request without token → 401', async ({ request }) => {
    const response = await request.post(`${BASE_URL}${CREATE_ENDPOINT}`, {
      headers: {
        Accept: 'application/json',
      },
      multipart: {
        leave_type_id: '4',
        start_date: today,
        end_date: today,
        reason: 'Unauthorized request',
        document: {
          name: 'sample.pdf',
          mimeType: 'application/pdf',
          buffer: fileBuffer,
        },
      },
    });

    const body = await parseBody(response);

    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-002 Create leave request with invalid token → 401', async ({ request }) => {
    const response = await request.post(`${BASE_URL}${CREATE_ENDPOINT}`, {
      headers: {
        Authorization: `Bearer ${INVALID_TOKEN}`,
        Accept: 'application/json',
      },
      multipart: {
        leave_type_id: '4',
        start_date: today,
        end_date: today,
        reason: 'Invalid token test',
        document: {
          name: 'sample.pdf',
          mimeType: 'application/pdf',
          buffer: fileBuffer,
        },
      },
    });

    const body = await parseBody(response);

    console.log('401 invalid token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-003 Missing required fields → 422', async ({ request }) => {
    const token = requireToken();

    const response = await request.post(`${BASE_URL}${CREATE_ENDPOINT}`, {
      headers: {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      multipart: {
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
      },
    });

    const body = await parseBody(response);

    console.log('422 missing fields:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
  });

  test('TC-NEG-004 Invalid date range → 422', async ({ request }) => {
    const token = requireToken();

    const response = await request.post(`${BASE_URL}${CREATE_ENDPOINT}`, {
      headers: {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      multipart: {
        leave_type_id: '4',
        start_date: '2026-06-30',
        end_date: '2026-06-20',
        reason: 'Invalid date range',
      },
    });

    const body = await parseBody(response);

    console.log('422 invalid date range:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
  });

  test('TC-NEG-005 Invalid leave_type_id → 422', async ({ request }) => {
    const token = requireToken();

    const response = await request.post(`${BASE_URL}${CREATE_ENDPOINT}`, {
      headers: {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      multipart: {
        leave_type_id: '999999',
        start_date: today,
        end_date: today,
        reason: 'Invalid leave type',
      },
    });

    const body = await parseBody(response);

    console.log('422 invalid leave type:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
  });
});