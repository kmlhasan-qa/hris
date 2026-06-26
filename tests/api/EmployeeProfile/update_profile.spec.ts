import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const ENDPOINT = '/api/profile/update';
const REQUEST_TIMEOUT = 10;

const VALID_PAYLOAD = {
  residential_address: 'Test Automation Playwright',
};

test.describe('Update Profile API', () => {
  const updateProfile = (
    request: APIRequestContext,
    headers: Record<string, string>,
    multipart: Record<string, any>,
    endpoint: string = `${BASE_URL}${ENDPOINT}`,
    options?: { timeout?: number }
  ) =>
    request.post(endpoint, {
      headers,
      multipart,
      ...options,
    });

  test('TC-001 Update profile with valid token returns 200', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await updateProfile(
      request,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      VALID_PAYLOAD
    );

    const body = await parseBody(response);
    console.log('profile update response:', JSON.stringify(body, null, 2));

    expect(response.status(), 'expected 200 OK').toBe(200);
    expect(body).toBeTruthy();

    if (typeof body.success !== 'undefined') {
      expect(body.success).toBe(true);
    }
  });

  test('TC-002 Update profile with invalid token returns 401', async ({
    request,
  }) => {
    const response = await updateProfile(
      request,
      {
        ...authHeaders(INVALID_TOKEN, false),
        Accept: 'application/json',
      },
      VALID_PAYLOAD
    );

    const body = await parseBody(response);
    console.log(
      'profile update invalid token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status(), 'expected 401 Unauthorized').toBe(401);
  });

  test('TC-003 Update profile with invalid emergency contact email returns 422', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await updateProfile(
      request,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      {
        emergency_contact_email: 'wronginput',
      }
    );

    const body = await parseBody(response);
    console.log(
      'profile update validation error response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status(), 'expected 422 Unprocessable Entity').toBe(422);
    expect(body.message || body.errors || body.error).toBeTruthy();
  });

  test('TC-004 Update profile without token returns 401', async ({
    request,
  }) => {
    const response = await updateProfile(
      request,
      {
        Accept: 'application/json',
      },
      VALID_PAYLOAD
    );

    const body = await parseBody(response);
    console.log(
      'profile update without token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(401);
  });

  test('TC-005 Update profile with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.post(
        'https://invalid-domain-for-testing-12345.com/api/profile/update'
      );
    }).rejects.toThrow();
  });

  test('TC-006 Update profile with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await updateProfile(
        request,
        {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
        VALID_PAYLOAD,
        `${BASE_URL}${ENDPOINT}`,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});