import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const ENDPOINT = '/api/attendances/open';
const REQUEST_TIMEOUT = 10;

test.describe('Open Attendance API', () => {
  async function getOpenAttendance(
    request: APIRequestContext,
    headers: Record<string, string>,
    endpoint: string = ENDPOINT,
    options?: { timeout?: number }
  ) {
    const response = await request.get(endpoint, {
      headers,
      ...options,
    });

    const body = await parseBody(response);
    return { response, body };
  }

  async function logResponse(label: string, body: any, status?: number) {
    console.log(
      `${label}${status ? ` [${status}]` : ''}:`,
      JSON.stringify(body, null, 2)
    );
  }

  test('TC-001 Get open attendance with valid token returns 200 success', async ({
    request,
  }) => {
    const token = requireToken();

    const { response, body } = await getOpenAttendance(
      request,
      authHeaders(token)
    );

    await logResponse('open attendance response', body, response.status());

    expect(response.status()).toBe(200);
    expect(body).toBeTruthy();

    if (typeof body.success !== 'undefined') {
      expect(body.success).toBe(true);
    }

    if (typeof body.status_code !== 'undefined') {
      expect(body.status_code).toBe(200);
    }

    expect(body.data).toBeTruthy();
  });

  test('TC-002 Get open attendance with invalid token returns 401', async ({
    request,
  }) => {
    const { response, body } = await getOpenAttendance(
      request,
      authHeaders(INVALID_TOKEN)
    );

    await logResponse(
      'open attendance invalid token response',
      body,
      response.status()
    );

    expect(response.status()).toBe(401);
    expect(body.error || body.message || body.reason).toBeTruthy();
  });

  test('TC-003 Get open attendance without token returns 401', async ({
    request,
  }) => {
    const { response, body } = await getOpenAttendance(request, {
      Accept: 'application/json',
    });

    await logResponse(
      'open attendance without token response',
      body,
      response.status()
    );

    expect(response.status()).toBe(401);
    expect(body.error || body.message || body.reason).toBeTruthy();
  });

  test('TC-004 Get open attendance with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/attendances/open'
      );
    }).rejects.toThrow();
  });

  test('TC-005 Get open attendance with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await getOpenAttendance(
        request,
        authHeaders(token),
        ENDPOINT,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});