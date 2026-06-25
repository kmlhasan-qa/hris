import { test, expect } from '@playwright/test';
import { INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

test.describe('Team Attendance Detail API', () => {
  const ENDPOINT = '/api/attendances/team';

  const DEPARTMENT_PUBLIC_ID = '01KNRT91HVAYXH3R235QB723YN';
  const NOT_HEAD_DEPARTMENT_ID = '01KN124C4AKWAED6V1JEP7P7K2';

  const DEFAULT_QUERY = {
    from: '2026-05-01',
    month: '2026-05',
    to: '2026-05-31',
    date: '2026-05-01',
  };

  const INVALID_DEPARTMENT_MESSAGE = /Not a valid department/i;

  const buildDetailUrl = (
    departmentId: string | number,
    params: Record<string, string> = DEFAULT_QUERY
  ) => {
    const search = new URLSearchParams(params).toString();
    return `${ENDPOINT}/${departmentId}/detail?${search}`;
  };

  const getTeamAttendanceDetail = (
    request: any,
    departmentId: string | number,
    token: string,
    params?: Record<string, string>
  ) =>
    request.get(buildDetailUrl(departmentId, params), {
      headers: authHeaders(token, true),
    });

  test('TC-001 Get team attendance detail returns 200 success', async ({ request }) => {
    const token = requireToken();

    const response = await getTeamAttendanceDetail(
      request,
      DEPARTMENT_PUBLIC_ID,
      token
    );

    const body = await parseBody(response);
    console.log('team attendance detail response:', body);

    expect(response.status(), 'expected 200 OK').toBe(200);
  });

  test('TC-002 Get team attendance detail returns 401 unauthorized', async ({ request }) => {
    const response = await getTeamAttendanceDetail(
      request,
      DEPARTMENT_PUBLIC_ID,
      INVALID_TOKEN
    );

    const body = await parseBody(response);
    console.log('team attendance detail unauthorized response:', body);

    expect(response.status(), 'expected 401 Unauthorized').toBe(401);
  });

  test('TC-003 Get team attendance detail with invalid department returns 400', async ({ request }) => {
    const token = requireToken();

    const response = await getTeamAttendanceDetail(request, 1, token);
    const body = await parseBody(response);

    console.log('invalid department response:', body);

    expect(response.status(), 'expected 400 Bad Request').toBe(400);
    expect(body?.message).toMatch(INVALID_DEPARTMENT_MESSAGE);
  });

  test('TC-004 Get team attendance detail with non-head department returns 400', async ({ request }) => {
    const token = requireToken();

    const response = await getTeamAttendanceDetail(
      request,
      NOT_HEAD_DEPARTMENT_ID,
      token
    );

    const body = await parseBody(response);
    console.log('not head department response:', body);

    expect(response.status(), 'expected 400 Bad Request').toBe(400);
    expect(body?.message).toMatch(INVALID_DEPARTMENT_MESSAGE);
  });

  test('TC-005 Get team attendance detail with missing date returns 422', async ({ request }) => {
    const token = requireToken();

    const invalidQuery = {
      from: '2026-05-01',
      month: '2026-05',
      to: '2026-05-31',
    };

    const response = await getTeamAttendanceDetail(
      request,
      DEPARTMENT_PUBLIC_ID,
      token,
      invalidQuery
    );

    const body = await parseBody(response);
    console.log('validation error response:', body);

    expect(response.status(), 'expected 422 Unprocessable Entity').toBe(422);
    expect(body?.message).toMatch(/date field is required/i);
    expect(body?.errors?.date).toBeTruthy();
  });
});