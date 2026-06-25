import { test, expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import { INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

test.describe('Attendance API', () => {
  const CLOCK_IN_ENDPOINT = '/api/attendances/clock-in';
  const CLOCK_OUT_ENDPOINT = '/api/attendances/clock-out';
  const OPEN_ATTENDANCE_ENDPOINT = '/api/attendances/open';

  const VALID_PAYLOAD = {
    site_id: 34,
    latitude: 33.779159,
    longitude: -84.42072,
    roster_id: 33,
  };

  type AttendancePayload = Record<string, unknown>;

  const clockIn = (
    request: APIRequestContext,
    token: string,
    data: AttendancePayload
  ) =>
    request.post(CLOCK_IN_ENDPOINT, {
      headers: authHeaders(token, true),
      data,
    });

  const clockOut = (
    request: APIRequestContext,
    token: string,
    data: AttendancePayload
  ) =>
    request.post(CLOCK_OUT_ENDPOINT, {
      headers: authHeaders(token, true),
      data,
    });

  async function logResponse(label: string, response: APIResponse) {
    const body = await parseBody(response);
    console.log(`${label} [${response.status()}]:`, JSON.stringify(body, null, 2));
    return body;
  }

  async function fetchOpenAttendance(request: APIRequestContext, token: string) {
    const response = await request.get(OPEN_ATTENDANCE_ENDPOINT, {
      headers: authHeaders(token),
    });

    const body = await logResponse('open attendance', response);
    return response.status() === 200 ? body?.data?.data_open_attendance ?? null : null;
  }

  async function closeOpenAttendance(
    request: APIRequestContext,
    token: string,
    open: any
  ) {
    return clockOut(request, token, {
      attendance_id: open?.id,
      site_id: open?.site?.id ?? VALID_PAYLOAD.site_id,
      latitude: open?.check_in_latitude ?? VALID_PAYLOAD.latitude,
      longitude: open?.check_in_longitude ?? VALID_PAYLOAD.longitude,
    });
  }

  test('TC-001 Clock in then clock out', async ({ request }) => {
    const token = requireToken();

    const existingOpen = await fetchOpenAttendance(request, token).catch(() => null);

    if (existingOpen) {
      const closeResp = await closeOpenAttendance(request, token, existingOpen);
      await logResponse('close pre-existing open attendance', closeResp);
      expect(closeResp.status(), 'failed to close pre-existing open attendance').toBe(200);
    }

    const clockInResp = await clockIn(request, token, VALID_PAYLOAD);
    const clockInBody = await logResponse('clock-in', clockInResp);

    expect(clockInResp.status()).toBe(201);

    const clockOutResp = await clockOut(request, token, {
      attendance_id: clockInBody?.data?.id,
      site_id: VALID_PAYLOAD.site_id,
      latitude: VALID_PAYLOAD.latitude,
      longitude: VALID_PAYLOAD.longitude,
    });

    await logResponse('clock-out', clockOutResp);
    expect(clockOutResp.status()).toBe(200);
  });

  test('TC-002 Clock in with invalid token returns 401', async ({ request }) => {
    const response = await clockIn(request, INVALID_TOKEN, VALID_PAYLOAD);

    await logResponse('clock-in invalid token', response);
    expect(response.status()).toBe(401);
  });

  test('TC-003 Clock in with missing required fields returns 422', async ({ request }) => {
    const token = requireToken();
    const response = await clockIn(request, token, { site_id: 0 });

    await logResponse('clock-in validation', response);
    expect(response.status()).toBe(422);
  });

  test('TC-004 Clock out with invalid token returns 401', async ({ request }) => {
    const response = await clockOut(request, INVALID_TOKEN, VALID_PAYLOAD);

    await logResponse('clock-out invalid token', response);
    expect(response.status()).toBe(401);
  });

  test('TC-005 Clock out with missing required fields returns 422', async ({ request }) => {
    const token = requireToken();
    const response = await clockOut(request, token, { site_id: 0 });

    await logResponse('clock-out validation', response);
    expect(response.status()).toBe(422);
  });
});