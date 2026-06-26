import { test, expect } from '@playwright/test';
import { INVALID_TOKEN, requireToken } from '../_shared';
import {
  ENDPOINTS,
  VALID_PAYLOAD,
  attendanceRequest,
  logResponse,
} from '../../../helpers/attendance.helper';

const REQUEST_TIMEOUT = 10;

test.describe('Attendance API - Negative', () => {
  test('TC-001 Clock in invalid token → 401', async ({ request }) => {
    const response = await attendanceRequest(
      request,
      'POST',
      ENDPOINTS.clockIn,
      INVALID_TOKEN,
      VALID_PAYLOAD
    );

    await logResponse('clock-in invalid token', response);
    expect(response.status()).toBe(401);
  });

  test('TC-002 Clock in validation error → 422', async ({ request }) => {
    const token = requireToken();

    const response = await attendanceRequest(
      request,
      'POST',
      ENDPOINTS.clockIn,
      token,
      { site_id: 0 }
    );

    await logResponse('clock-in validation', response);
    expect(response.status()).toBe(422);
  });

  test('TC-003 Clock out invalid token → 401', async ({ request }) => {
    const response = await attendanceRequest(
      request,
      'POST',
      ENDPOINTS.clockOut,
      INVALID_TOKEN,
      VALID_PAYLOAD
    );

    await logResponse('clock-out invalid token', response);
    expect(response.status()).toBe(401);
  });

  test('TC-004 Clock out validation error → 422', async ({ request }) => {
    const token = requireToken();

    const response = await attendanceRequest(
      request,
      'POST',
      ENDPOINTS.clockOut,
      token,
      { site_id: 0 }
    );

    await logResponse('clock-out validation', response);
    expect(response.status()).toBe(422);
  });

  test('TC-005 Clock in unreachable host → failed to fetch', async ({ request }) => {
    await expect(async () => {
      await request.post(
        'https://invalid-domain-for-testing-12345.com/api/attendances/clock-in',
        {
          data: VALID_PAYLOAD,
        }
      );
    }).rejects.toThrow();
  });

  test('TC-006 Clock in timeout → failed to fetch', async ({ request }) => {
    const token = requireToken();

    await expect(async () => {
      await request.post(ENDPOINTS.clockIn, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: VALID_PAYLOAD,
        timeout: REQUEST_TIMEOUT,
      });
    }).rejects.toThrow();
  });

  test('TC-007 Clock out unreachable host → failed to fetch', async ({ request }) => {
    await expect(async () => {
      await request.post(
        'https://invalid-domain-for-testing-12345.com/api/attendances/clock-out',
        {
          data: VALID_PAYLOAD,
        }
      );
    }).rejects.toThrow();
  });

  test('TC-008 Clock out timeout → failed to fetch', async ({ request }) => {
    const token = requireToken();

    await expect(async () => {
      await request.post(ENDPOINTS.clockOut, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: VALID_PAYLOAD,
        timeout: REQUEST_TIMEOUT,
      });
    }).rejects.toThrow();
  });
});