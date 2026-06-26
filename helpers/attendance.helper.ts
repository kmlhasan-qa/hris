import {
  type APIRequestContext,
  type APIResponse,
} from '@playwright/test';
import { BASE_URL, authHeaders, parseBody } from '../tests/api/_shared';

export const ENDPOINTS = {
  clockIn: '/api/attendances/clock-in',
  clockOut: '/api/attendances/clock-out',
  open: '/api/attendances/open',
};

export const VALID_PAYLOAD = {
  site_id: 34,
  latitude: 33.779159,
  longitude: -84.42072,
  roster_id: 33,
};

export type AttendancePayload = Record<string, unknown>;

export type OpenAttendance = {
  id?: number;
  site?: { id?: number };
  check_in_latitude?: number;
  check_in_longitude?: number;
};

export async function attendanceRequest(
  request: APIRequestContext,
  method: 'GET' | 'POST',
  endpoint: string,
  token: string,
  data?: AttendancePayload
) {
  const options = {
    headers: authHeaders(token, method === 'POST'),
    ...(data ? { data } : {}),
  };

  return method === 'GET'
    ? request.get(endpoint, options)
    : request.post(endpoint, options);
}

export async function logResponse(label: string, response: APIResponse) {
  const body = await parseBody(response);
  console.log(`${label} [${response.status()}]:`, JSON.stringify(body, null, 2));
  return body;
}

export async function fetchOpenAttendance(
  request: APIRequestContext,
  token: string
): Promise<OpenAttendance | null> {
  const response = await attendanceRequest(
    request,
    'GET',
    ENDPOINTS.open,
    token
  );

  const body = await logResponse('open attendance', response);

  if (response.status() !== 200) return null;

  return body?.data?.data_open_attendance ?? null;
}

export async function closeOpenAttendance(
  request: APIRequestContext,
  token: string,
  open: OpenAttendance
) {
  return attendanceRequest(request, 'POST', ENDPOINTS.clockOut, token, {
    attendance_id: open.id,
    site_id: open.site?.id ?? VALID_PAYLOAD.site_id,
    latitude: open.check_in_latitude ?? VALID_PAYLOAD.latitude,
    longitude: open.check_in_longitude ?? VALID_PAYLOAD.longitude,
  });
}