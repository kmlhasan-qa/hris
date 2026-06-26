import { test, expect } from '@playwright/test';
import { requireToken } from '../_shared';
import {
  ENDPOINTS,
  VALID_PAYLOAD,
  attendanceRequest,
  logResponse,
  fetchOpenAttendance,
  closeOpenAttendance,
} from '../../../helpers/attendance.helper';

test.describe('Attendance API - E2E Flow', () => {
  test('TC-001 Clock in then clock out', async ({ request }) => {
    const token = requireToken();

    const openAttendance = await fetchOpenAttendance(request, token).catch(
      () => null
    );

    if (openAttendance) {
      const closeResponse = await closeOpenAttendance(
        request,
        token,
        openAttendance
      );

      await logResponse('close pre-existing attendance', closeResponse);
      expect(closeResponse.status()).toBe(200);
    }

    const clockInResponse = await attendanceRequest(
      request,
      'POST',
      ENDPOINTS.clockIn,
      token,
      VALID_PAYLOAD
    );

    const clockInBody = await logResponse('clock-in', clockInResponse);
    expect(clockInResponse.status()).toBe(201);

    const clockOutResponse = await attendanceRequest(
      request,
      'POST',
      ENDPOINTS.clockOut,
      token,
      {
        attendance_id: clockInBody?.data?.id,
        site_id: VALID_PAYLOAD.site_id,
        latitude: VALID_PAYLOAD.latitude,
        longitude: VALID_PAYLOAD.longitude,
      }
    );

    await logResponse('clock-out', clockOutResponse);
    expect(clockOutResponse.status()).toBe(200);
  });
});