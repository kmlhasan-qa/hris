import { test, expect, type APIResponse } from '@playwright/test';
import { getAuthToken } from '../../helpers/token.store';
import { HRIS_BASE_URL } from '../../helpers/config';

export const BASE_URL = HRIS_BASE_URL;
export const INVALID_TOKEN = 'invalid-token';

/** Build request headers, attaching a bearer token and/or JSON content type as needed. */
export function authHeaders(token?: string | null, json = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
}

/** Parse a JSON body, falling back to an empty object on non-JSON / empty responses. */
export function parseBody(response: APIResponse): Promise<any> {
  return response.json().catch(() => ({}));
}

/** Skip the current test when no auth token is available, otherwise return it. */
export function requireToken(): string {
  const token = getAuthToken();
  test.skip(!token, 'Auth token not found; run tests/api/Auth/login.spec.ts first to generate finalToken');
  return token as string;
}

/**
 * Shared shape assertion: on the expected success status the body must look
 * like a success payload, otherwise it must carry an error message.
 */
export async function assertSuccessOrError(response: APIResponse, okStatus = 200): Promise<any> {
  const body = await parseBody(response);

  if (response.status() === okStatus) {
    expect(body).toBeTruthy();
    if (typeof body.success !== 'undefined') expect(body.success).toBe(true);
    if (typeof body.status !== 'undefined') expect(String(body.status).toLowerCase()).toMatch(/success|ok/);
    expect(body.data || body.rosters || body.version || body).toBeTruthy();
  } else {
    expect(body.error || body.message || body.reason).toBeTruthy();
  }

  return body;
}

/**
 * Register the standard "valid token → 200 / invalid token → 401" test pair
 * shared by every read-only authenticated GET endpoint.
 */
export function testAuthedGetEndpoint(label: string, path: string): void {
  test(`TC-001 ${label} with valid token returns 200 success`, async ({ request }) => {
    const token = requireToken();
    const response = await request.get(`${BASE_URL}${path}`, { headers: authHeaders(token) });

    expect(response.status()).toBe(200);
    await assertSuccessOrError(response);
  });

  test(`TC-002 ${label} with invalid token returns 401 error`, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${path}`, { headers: authHeaders(INVALID_TOKEN) });

    expect(response.status()).toBe(401);
    await assertSuccessOrError(response);
  });
}
