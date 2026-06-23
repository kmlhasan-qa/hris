import { test, expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const VALID_PAYLOAD = {
  site_id: 34,
  latitude: 33.779159,
  longitude: -84.42072,
  roster_id: 33,
};

const clockIn = (request: APIRequestContext, token: string, data: Record<string, unknown>) =>
  request.post(`${BASE_URL}/api/attendances/clock-in`, { headers: authHeaders(token, true), data });

const clockOut = (request: APIRequestContext, token: string, data: Record<string, unknown>) =>
  request.post(`${BASE_URL}/api/attendances/clock-out`, { headers: authHeaders(token, true), data });

/** Fetch the currently open attendance record, or null if none exists. */
async function fetchOpenAttendance(request: APIRequestContext, token: string): Promise<any | null> {
  const response = await request.get(`${BASE_URL}/api/attendances/open`, { headers: authHeaders(token) });
  const body = await parseBody(response);
  console.log('open attendance status:', response.status(), 'body:', JSON.stringify(body, null, 2));
  return response.status() === 200 ? body?.data?.data_open_attendance ?? null : null;
}

/** Close an open attendance, deriving the clock-out payload from the open record. */
async function closeOpenAttendance(request: APIRequestContext, token: string, open: any): Promise<APIResponse> {
  const response = await clockOut(request, token, {
    attendance_id: open?.id,
    site_id: open?.site?.id ?? VALID_PAYLOAD.site_id,
    latitude: open?.check_in_latitude ?? VALID_PAYLOAD.latitude,
    longitude: open?.check_in_longitude ?? VALID_PAYLOAD.longitude,
  });
  console.log('close open attendance status:', response.status(), 'body:', JSON.stringify(await parseBody(response), null, 2));
  return response;
}

async function assertClockInResponse(response: APIResponse): Promise<any> {
  const body = await parseBody(response);

  // strict: clock-in success must be 201
  if (response.status() === 201) {
    expect(body).toBeTruthy();
    if (typeof body.success !== 'undefined') expect(body.success).toBe(true);
    if (typeof body.status !== 'undefined') expect(String(body.status).toLowerCase()).toMatch(/success|ok/);
    expect(body.data || body).toBeTruthy();
  } else {
    console.log(`clock-in unexpected response [${response.status()}]:`, JSON.stringify(body, null, 2));
    expect(body.error || body.message || body.errors || body.reason).toBeTruthy();
  }

  return body;
}

async function assertClockOutResponse(response: APIResponse): Promise<any> {
  const body = await parseBody(response);

  if (response.status() >= 200 && response.status() < 300) {
    expect(body).toBeTruthy();
    if (typeof body.success !== 'undefined') expect(body.success).toBe(true);
    expect(body.data || body).toBeTruthy();
  } else {
    console.log(`clock-out error response [${response.status()}]:`, JSON.stringify(body, null, 2));
    expect(body.error || body.message || body.errors || body.reason).toBeTruthy();
  }

  return body;
}

test('TC-001 Clock in then clock out when clock-in succeeds', async ({ request }) => {
  const token = requireToken();

  // Pre-check: close any pre-existing open attendance so clock-in can succeed.
  const existingOpen = await fetchOpenAttendance(request, token).catch((e: any) => {
    console.log('pre-check open attendance failed:', e?.message ?? String(e));
    return null;
  });
  if (existingOpen) {
    console.log('Found open attendance; attempting to close it before clock-in');
    await closeOpenAttendance(request, token, existingOpen);
  }

  // Clock-in attempt.
  let clockInResp = await clockIn(request, token, VALID_PAYLOAD);
  let clockInBody = await parseBody(clockInResp);
  console.log('clock-in attempt status:', clockInResp.status(), 'body:', JSON.stringify(clockInBody, null, 2));

  // If clock-in was rejected due to an open attendance, close it then retry once.
  if (clockInResp.status() === 422) {
    const errText = String(clockInBody?.message || JSON.stringify(clockInBody?.errors || '')).toLowerCase();
    if (errText.includes('open attendance') || errText.includes('previous clock-out')) {
      console.log('Detected open-attendance validation error; closing open attendance then retrying clock-in');

      const open = await fetchOpenAttendance(request, token);
      if (open?.id) {
        await closeOpenAttendance(request, token, open);
        clockInResp = await clockIn(request, token, VALID_PAYLOAD);
        clockInBody = await parseBody(clockInResp);
        console.log('clock-in retry status:', clockInResp.status(), 'body:', JSON.stringify(clockInBody, null, 2));
      } else {
        console.log('No attendance_id found to auto-close; skipping retry');
      }
    }
  }

  // strict: expect 201 for clock-in
  expect(clockInResp.status()).toBe(201);
  await assertClockInResponse(clockInResp);

  // Clock out the attendance we just opened.
  const clockOutResp = await clockOut(request, token, {
    attendance_id: clockInBody?.data?.id,
    site_id: VALID_PAYLOAD.site_id,
    latitude: VALID_PAYLOAD.latitude,
    longitude: VALID_PAYLOAD.longitude,
  });
  console.log('clock-out status:', clockOutResp.status());

  // strict: expect 200 for clock-out
  expect(clockOutResp.status()).toBe(200);
  await assertClockOutResponse(clockOutResp);
});

test('TC-002 Clock in with invalid token returns 401 unauthorized', async ({ request }) => {
  const response = await clockIn(request, INVALID_TOKEN, VALID_PAYLOAD);

  console.log('clock-in invalid token response:', JSON.stringify(await parseBody(response), null, 2));
  expect(response.status()).toBe(401);
  await assertClockInResponse(response);
});

test('TC-003 Clock in with missing required fields returns 422 validation error', async ({ request }) => {
  const token = requireToken();
  const response = await clockIn(request, token, { site_id: 0 });

  console.log('clock-in validation error response:', JSON.stringify(await parseBody(response), null, 2));
  expect(response.status()).toBe(422);
  await assertClockInResponse(response);
});

test('TC-004 Clock out with invalid token returns 401 unauthorized', async ({ request }) => {
  const response = await clockOut(request, INVALID_TOKEN, VALID_PAYLOAD);

  expect(response.status()).toBe(401);
  await assertClockOutResponse(response);
});

test('TC-005 Clock out with missing required fields returns 422 validation error', async ({ request }) => {
  const token = requireToken();
  const response = await clockOut(request, token, { site_id: 0 });

  expect(response.status()).toBe(422);
  await assertClockOutResponse(response);
});
