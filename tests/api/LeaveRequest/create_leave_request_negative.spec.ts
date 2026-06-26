import path from 'path';
import fs from 'fs';
import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const CREATE_ENDPOINT = '/api/leave-requests';
const REQUEST_TIMEOUT = 10;
const today = new Date().toISOString().split('T')[0];

const pdfPath = path.join(process.cwd(), 'fixtures/sample.pdf');
const fileBuffer = fs.readFileSync(pdfPath);

const VALID_MULTIPART = {
  leave_type_id: '4',
  start_date: today,
  end_date: today,
  reason: 'Automation leave request',
  document: {
    name: 'sample.pdf',
    mimeType: 'application/pdf',
    buffer: fileBuffer,
  },
};

test.describe('Leave Request API - Negative Scenarios', () => {
  const createLeaveRequest = (
    request: APIRequestContext,
    headers: Record<string, string>,
    multipart: Record<string, any>,
    endpoint: string = `${BASE_URL}${CREATE_ENDPOINT}`,
    options?: { timeout?: number }
  ) =>
    request.post(endpoint, {
      headers,
      multipart,
      ...options,
    });

  test('TC-NEG-001 Create leave request without token → 401', async ({
    request,
  }) => {
    const response = await createLeaveRequest(
      request,
      {
        Accept: 'application/json',
      },
      VALID_MULTIPART
    );

    const body = await parseBody(response);
    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-002 Create leave request with invalid token → 401', async ({
    request,
  }) => {
    const response = await createLeaveRequest(
      request,
      {
        Authorization: `Bearer ${INVALID_TOKEN}`,
        Accept: 'application/json',
      },
      VALID_MULTIPART
    );

    const body = await parseBody(response);
    console.log('401 invalid token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-NEG-003 Missing required fields → 422', async ({ request }) => {
    const token = requireToken();

    const response = await createLeaveRequest(
      request,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      {
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
      }
    );

    const body = await parseBody(response);
    console.log('422 missing fields:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
  });

  test('TC-NEG-004 Invalid date range → 422', async ({ request }) => {
    const token = requireToken();

    const response = await createLeaveRequest(
      request,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      {
        leave_type_id: '4',
        start_date: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString().split('T')[0],
        end_date: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString().split('T')[0],
        reason: 'Invalid date range',
      }
    );

    const body = await parseBody(response);
    console.log('422 invalid date range:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
  });

  test('TC-NEG-005 Invalid leave_type_id → 422', async ({ request }) => {
    const token = requireToken();

    const response = await createLeaveRequest(
      request,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      {
        leave_type_id: '999999',
        start_date: today,
        end_date: today,
        reason: 'Invalid leave type',
      }
    );

    const body = await parseBody(response);
    console.log('422 invalid leave type:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
  });

  test('TC-NEG-006 Create leave request with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.post(
        'https://invalid-domain-for-testing-12345.com/api/leave-requests'
      );
    }).rejects.toThrow();
  });

  test('TC-NEG-007 Create leave request with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await createLeaveRequest(
        request,
        {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
        VALID_MULTIPART,
        `${BASE_URL}${CREATE_ENDPOINT}`,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});