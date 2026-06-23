import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from './_shared';

const departmentPublicId = '01KNRT91HVAYXH3R235QB723YN';
const query = 'from=2026-05-01&month=2026-05&to=2026-05-31';

const teamUrl = (departmentId: string | number) =>
  `${BASE_URL}/api/attendances/team/${departmentId}?${query}`;

const INVALID_DEPARTMENT_MESSAGE = /Not a head of department or an invalid department id provided\./;

test('TC-001 Get team attendance - success 200', async ({ request }) => {
  const token = requireToken();
  const res = await request.get(teamUrl(departmentPublicId), { headers: authHeaders(token, true) });

  console.log('team attendance response body:', await parseBody(res));
  expect(res.status(), 'expected 200 OK').toBe(200);
});

test('TC-002 Get team attendance - unauthorized 401', async ({ request }) => {
  const res = await request.get(teamUrl(departmentPublicId), { headers: authHeaders(INVALID_TOKEN, true) });

  console.log('team attendance (unauthorized) response body:', await parseBody(res));
  expect(res.status(), 'expected 401 Unauthorized').toBe(401);
});

test('TC-003 Get team attendance - invalid department or not head returns 400', async ({ request }) => {
  const token = requireToken();
  const res = await request.get(teamUrl(1), { headers: authHeaders(token, true) });

  const body = await parseBody(res);
  console.log('team attendance invalid department response body:', body);
  expect(res.status(), 'expected 400 Bad Request').toBe(400);
  expect(body?.message).toMatch(INVALID_DEPARTMENT_MESSAGE);
});

test('TC-004 Get team attendance - not head of department returns 400', async ({ request }) => {
  const token = requireToken();
  const res = await request.get(teamUrl('01KN124C4AKWAED6V1JEP7P7K2'), { headers: authHeaders(token, true) });

  const body = await parseBody(res);
  console.log('team attendance not head response body:', body);
  expect(res.status(), 'expected 400 Bad Request').toBe(400);
  expect(body?.message).toMatch(INVALID_DEPARTMENT_MESSAGE);
});
