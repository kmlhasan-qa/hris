import { test, expect } from '@playwright/test';
import { getAuthToken } from '../../helpers/token.store';

const BASE_URL = 'https://hris.itmanage.com.au';

const departmentPublicId = '01KNRT91HVAYXH3R235QB723YN';
const query = 'from=2026-05-01&month=2026-05&to=2026-05-31';

test('TC-001 Get team attendance - success 200', async ({ request }) => {
  const token = getAuthToken();
  if (!token) test.skip(true, 'No auth token available. Run login.spec.ts first to save token.');

  const res = await request.get(`${BASE_URL}/api/attendances/team/${departmentPublicId}?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const body = await res.json().catch(() => ({}));
  console.log('team attendance response body:', body);

  expect(res.status(), 'expected 200 OK').toBe(200);
});

test('TC-002 Get team attendance - unauthorized 401', async ({ request }) => {
  const res = await request.get(`${BASE_URL}/api/attendances/team/${departmentPublicId}?${query}`, {
    headers: {
      Authorization: `Bearer invalid_token`,
      'Content-Type': 'application/json',
    },
  });

  const body = await res.json().catch(() => ({}));
  console.log('team attendance (unauthorized) response body:', body);

  expect(res.status(), 'expected 401 Unauthorized').toBe(401);
});

test('TC-003 Get team attendance - invalid department or not head returns 400', async ({ request }) => {
  const token = getAuthToken();
  if (!token) test.skip(true, 'No auth token available. Run login.spec.ts first to save token.');

  const invalidDepartmentId = 1;
  const res = await request.get(`${BASE_URL}/api/attendances/team/${invalidDepartmentId}?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const body = await res.json().catch(() => ({}));
  console.log('team attendance invalid department response body:', body);

  expect(res.status(), 'expected 400 Bad Request').toBe(400);
  expect(body?.message).toMatch(/Not a head of department or an invalid department id provided\./);
});

test('TC-004 Get team attendance - not head of department returns 400', async ({ request }) => {
  const token = getAuthToken();
  if (!token) test.skip(true, 'No auth token available. Run login.spec.ts first to save token.');

  const notHeadDepartmentId = '01KN124C4AKWAED6V1JEP7P7K2';
  const res = await request.get(`${BASE_URL}/api/attendances/team/${notHeadDepartmentId}?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const body = await res.json().catch(() => ({}));
  console.log('team attendance not head response body:', body);

  expect(res.status(), 'expected 400 Bad Request').toBe(400);
  expect(body?.message).toMatch(/Not a head of department or an invalid department id provided\./);
});
