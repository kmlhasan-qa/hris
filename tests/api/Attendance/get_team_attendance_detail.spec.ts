import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

test.describe('Team Attendance Detail API', () => {
  const ENDPOINT = '/api/attendances/team';
  const REQUEST_TIMEOUT = 10;

  const DEPARTMENT_PUBLIC_ID = '01KNRT91HVAYXH3R235QB723YN';
  const NOT_HEAD_DEPARTMENT_ID = '01KN124C4AKWAED6V1JEP7P7K2';

  const DEFAULT_QUERY = {
    from: '2026-05-05',
    month: '2026-05',
    to: '2026-05-31',
    date: '2026-07-15',
  };

  const INVALID_DEPARTMENT_MESSAGE = /Not a valid department/i;

  const buildDetailUrl = (
    departmentId: string | number,
    params: Record<string, string> = DEFAULT_QUERY
  ) => {
    const search = new URLSearchParams(params).toString();
    return `${ENDPOINT}/${departmentId}/detail?${search}`;
  };

  async function getTeamAttendanceDetail(
    request: APIRequestContext,
    departmentId: string | number,
    headers: Record<string, string>,
    params?: Record<string, string>,
    options?: { timeout?: number; endpoint?: string }
  ) {
    const endpoint =
      options?.endpoint ?? buildDetailUrl(departmentId, params);

    const response = await request.get(endpoint, {
      headers,
      timeout: options?.timeout,
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

  test('TC-001 Get team attendance detail returns 200 success', async ({
    request,
  }) => {
    const token = requireToken();

    const { response, body } = await getTeamAttendanceDetail(
      request,
      DEPARTMENT_PUBLIC_ID,
      authHeaders(token, true),
      DEFAULT_QUERY
    );

    await logResponse('team attendance detail response', body, response.status());

    expect(response.status()).toBe(200);
  });

  test('TC-002 Get team attendance detail returns 401 unauthorized', async ({
    request,
  }) => {
    const { response, body } = await getTeamAttendanceDetail(
      request,
      DEPARTMENT_PUBLIC_ID,
      authHeaders(INVALID_TOKEN, true)
    );

    await logResponse('unauthorized response', body, response.status());

    expect(response.status()).toBe(401);
  });

  test('TC-003 Get team attendance detail without token returns 401', async ({
    request,
  }) => {
    const { response, body } = await getTeamAttendanceDetail(
      request,
      DEPARTMENT_PUBLIC_ID,
      {
        Accept: 'application/json',
      }
    );

    await logResponse('missing token response', body, response.status());

    expect(response.status()).toBe(401);
  });

  test('TC-004 Get team attendance detail with invalid department returns 400', async ({
    request,
  }) => {
    const token = requireToken();

    const { response, body } = await getTeamAttendanceDetail(
      request,
      1,
      authHeaders(token, true)
    );

    await logResponse('invalid department response', body, response.status());

    expect(response.status()).toBe(400);
    expect(body?.message).toMatch(INVALID_DEPARTMENT_MESSAGE);
  });

  test('TC-005 Get team attendance detail with non-head department returns 400', async ({
    request,
  }) => {
    const token = requireToken();

    const { response, body } = await getTeamAttendanceDetail(
      request,
      NOT_HEAD_DEPARTMENT_ID,
      authHeaders(token, true)
    );

    await logResponse('non-head department response', body, response.status());

    expect(response.status()).toBe(400);
    expect(body?.message).toMatch(INVALID_DEPARTMENT_MESSAGE);
  });

  test('TC-006 Get team attendance detail with missing date returns 422', async ({
    request,
  }) => {
    const token = requireToken();

    const invalidQuery = {
      from: '2026-05-01',
      month: '2026-05',
      to: '2026-05-31',
    };

    const { response, body } = await getTeamAttendanceDetail(
      request,
      DEPARTMENT_PUBLIC_ID,
      authHeaders(token, true),
      invalidQuery
    );

    await logResponse('validation error response', body, response.status());

    expect(response.status()).toBe(422);
    expect(body?.message).toMatch(/date field is required/i);
    expect(body?.errors?.date).toBeTruthy();
  });

  test('TC-007 Get team attendance detail with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/attendances/team'
      );
    }).rejects.toThrow();
  });

  test('TC-008 Get team attendance detail with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await getTeamAttendanceDetail(
        request,
        DEPARTMENT_PUBLIC_ID,
        authHeaders(token, true),
        DEFAULT_QUERY,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});