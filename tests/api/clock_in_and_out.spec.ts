import { test, expect, type APIResponse } from '@playwright/test';
import { getAuthToken } from '../../helpers/token.store';

const BASE_URL = 'https://hris.itmanage.com.au';
const VALID_PAYLOAD = {
  site_id: 23,
  latitude: -7.320057,
  longitude: 112.731791,
  roster_id: 46,
};

async function parseBody(response: APIResponse) {
  return await response.json().catch(() => ({}));
}

async function assertClockInResponse(response: APIResponse) {
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

async function assertClockOutResponse(response: APIResponse) {
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

test.describe('HRIS attendance flow (clock-in -> clock-out)', () => {
  test('TC-001 Clock in then clock out when clock-in succeeds', async ({ request }) => {
    const token = getAuthToken();
    test.skip(!token, 'Auth token not found; run tests/api/hris_login.spec.ts first to generate finalToken');

    
    // Pre-check: see if an open attendance exists and close it first
    try {
      const openResp = await request.get(`${BASE_URL}/api/attendances/open`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const openBody = await parseBody(openResp);
      console.log('pre-check open attendance status:', openResp.status(), 'body:', JSON.stringify(openBody, null, 2));
      if (openResp.status() === 200 && openBody?.data?.data_open_attendance) {
        console.log('Found open attendance; attempting to close it before clock-in');
        const open = openBody.data.data_open_attendance;
        const attendanceId = open.id;
        const preClose = await request.post(`${BASE_URL}/api/attendances/clock-out`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          data: {
            attendance_id: attendanceId,
            site_id: open.site?.id ?? VALID_PAYLOAD.site_id,
            latitude: open.check_in_latitude ?? VALID_PAYLOAD.latitude,
            longitude: open.check_in_longitude ?? VALID_PAYLOAD.longitude,
          },
        });
        console.log('pre-close status:', preClose.status(), 'body:', JSON.stringify(await parseBody(preClose), null, 2));
      }
    } catch (e: any) {
      console.log('pre-check open attendance failed:', e?.message ?? String(e));
    }

    // Clock-in attempt
    let clockInResp = await request.post(`${BASE_URL}/api/attendances/clock-in`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: VALID_PAYLOAD,
    });

    let clockInBody = await parseBody(clockInResp);
    console.log('clock-in attempt status:', clockInResp.status(), 'body:', JSON.stringify(clockInBody, null, 2));

    // If clock-in was rejected due to an open attendance, try to close then retry once
    if (clockInResp.status() === 422) {
      const errText = String(clockInBody?.message || JSON.stringify(clockInBody?.errors || '')).toLowerCase();
      if (errText.includes('open attendance') || errText.includes('previous clock-out')) {
        console.log('Detected open-attendance validation error; attempting to close open attendance then retry clock-in');

        // fetch open attendance to get attendance_id
        const refreshOpen = await request.get(`${BASE_URL}/api/attendances/open`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const refreshOpenBody = await parseBody(refreshOpen);
        console.log('refresh open attendance status:', refreshOpen.status(), 'body:', JSON.stringify(refreshOpenBody, null, 2));

        const open = refreshOpenBody?.data?.data_open_attendance;
        const attendanceId = open?.id;
        if (attendanceId) {
          const autoClose = await request.post(`${BASE_URL}/api/attendances/clock-out`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            data: {
              attendance_id: attendanceId,
              site_id: open?.site?.id ?? VALID_PAYLOAD.site_id,
              latitude: open?.check_in_latitude ?? VALID_PAYLOAD.latitude,
              longitude: open?.check_in_longitude ?? VALID_PAYLOAD.longitude,
            },
          });
          console.log('auto-close status:', autoClose.status(), 'body:', JSON.stringify(await parseBody(autoClose), null, 2));

          // retry clock-in once
          clockInResp = await request.post(`${BASE_URL}/api/attendances/clock-in`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            data: VALID_PAYLOAD,
          });
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

    // attempt clock-out (only after confirmed 201)
    if (clockInResp.status() === 201) {
      const attendanceId = clockInBody?.data?.id;
      const clockOutResp = await request.post(`${BASE_URL}/api/attendances/clock-out`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          attendance_id: attendanceId,
          site_id: VALID_PAYLOAD.site_id,
          latitude: VALID_PAYLOAD.latitude,
          longitude: VALID_PAYLOAD.longitude,
        },
      });

      console.log('clock-out status:', clockOutResp.status());
      const clockOutBody = await parseBody(clockOutResp);
      console.log('clock-out body:', JSON.stringify(clockOutBody, null, 2));

      // strict: expect 200 for clock-out
      expect(clockOutResp.status()).toBe(200);
      await assertClockOutResponse(clockOutResp);
    } else {
      test.skip(true, 'Clock-in did not succeed; skipping clock-out');
    }
  });

  test('TC-002 Clock in with invalid token returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/attendances/clock-in`, {
      headers: {
        Authorization: 'Bearer invalid-token',
        'Content-Type': 'application/json',
      },
      data: VALID_PAYLOAD,
    });

    console.log('clock-in invalid token response:', JSON.stringify(await parseBody(response), null, 2));
    expect(response.status()).toBe(401);
    await assertClockInResponse(response);
  });

  test('TC-003 Clock in with missing required fields returns 422 validation error', async ({ request }) => {
    const token = getAuthToken();
    test.skip(!token, 'Auth token not found; run tests/api/hris_login.spec.ts first to generate finalToken');

    const response = await request.post(`${BASE_URL}/api/attendances/clock-in`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        site_id: 0,
      },
    });

    console.log('clock-in validation error response:', JSON.stringify(await parseBody(response), null, 2));
    expect(response.status()).toBe(422);
    await assertClockInResponse(response);
  });

  test('TC-004 Clock out with invalid token returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/attendances/clock-out`, {
      headers: {
        Authorization: 'Bearer invalid-token',
        'Content-Type': 'application/json',
      },
      data: VALID_PAYLOAD,
    });

    expect(response.status()).toBe(401);
    await assertClockOutResponse(response);
  });

  test('TC-005 Clock out with missing required fields returns 422 validation error', async ({ request }) => {
    const token = getAuthToken();
    test.skip(!token, 'Auth token not found; run tests/api/hris_login.spec.ts first to generate finalToken');

    const response = await request.post(`${BASE_URL}/api/attendances/clock-out`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        site_id: 0,
      },
    });

    expect(response.status()).toBe(422);
    await assertClockOutResponse(response);
  });
});
