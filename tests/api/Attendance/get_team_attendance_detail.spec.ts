import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const departmentPublicId = '01KNRT91HVAYXH3R235QB723YN';
const notHeadDepartmentId = '01KN124C4AKWAED6V1JEP7P7K2';
// The /detail endpoint requires a single `date` param; validation runs before
// the department-authorization check, so it must be present for the 200/400 cases.
const query = 'from=2026-05-01&month=2026-05&to=2026-05-31&date=2026-05-01';

const detailUrl = (departmentId: string | number, search = query) =>
  `${BASE_URL}/api/attendances/team/${departmentId}/detail?${search}`;

// The /detail endpoint returns this message for both an invalid id and a
// valid-but-not-head department (unlike the plain team endpoint's wording).
const INVALID_DEPARTMENT_MESSAGE = /Not a valid department/i;

test('TC-001 Get team attendance detail - success 200', async ({ request }) => {
  const token = requireToken();
  const res = await request.get(detailUrl(departmentPublicId), { headers: authHeaders(token, true) });

  console.log('team attendance detail response body:', await parseBody(res));
  expect(res.status(), 'expected 200 OK').toBe(200);
});

test('TC-002 Get team attendance detail - unauthorized 401', async ({ request }) => {
  const res = await request.get(detailUrl(departmentPublicId), { headers: authHeaders(INVALID_TOKEN, true) });

  console.log('team attendance detail (unauthorized) response body:', await parseBody(res));
  expect(res.status(), 'expected 401 Unauthorized').toBe(401);
});

test('TC-003 Get team attendance detail - invalid department returns 400', async ({ request }) => {
  const token = requireToken();
  const res = await request.get(detailUrl(1), { headers: authHeaders(token, true) });

  const body = await parseBody(res);
  console.log('team attendance detail invalid department response body:', body);
  expect(res.status(), 'expected 400 Bad Request').toBe(400);
  expect(body?.message).toMatch(INVALID_DEPARTMENT_MESSAGE);
});

test('TC-004 Get team attendance detail - not head of department returns 400', async ({ request }) => {
  const token = requireToken();
  const res = await request.get(detailUrl(notHeadDepartmentId), { headers: authHeaders(token, true) });

  const body = await parseBody(res);
  console.log('team attendance detail not head response body:', body);
  expect(res.status(), 'expected 400 Bad Request').toBe(400);
  expect(body?.message).toMatch(INVALID_DEPARTMENT_MESSAGE);
});

test('TC-005 Get team attendance detail - validation error returns 422', async ({ request }) => {
  const token = requireToken();
  // Omit the required `date` param to trigger a validation error.
  const res = await request.get(detailUrl(departmentPublicId, 'from=2026-05-01&month=2026-05&to=2026-05-31'), {
    headers: authHeaders(token, true),
  });

  const body = await parseBody(res);
  console.log('team attendance detail validation error response body:', body);
  expect(res.status(), 'expected 422 Unprocessable Entity').toBe(422);
  expect(body?.message).toMatch(/date field is required/i);
  expect(body?.errors?.date).toBeTruthy();
});
