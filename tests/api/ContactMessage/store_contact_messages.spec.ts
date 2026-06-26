import { test, expect, type APIRequestContext } from '@playwright/test';
import { INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

test.describe('Contact Messages API', () => {
  const ENDPOINT = '/api/contact-messages';
  const REQUEST_TIMEOUT = 10;

  const VALID_PAYLOAD = {
    subject_id: 1,
    department_id: 41,
    message: 'automation playwright',
  };

  const submitContactMessage = (
    request: APIRequestContext,
    headers: Record<string, string>,
    data: Record<string, string | number | boolean>,
    endpoint: string = ENDPOINT,
    options?: { timeout?: number }
  ) =>
    request.post(endpoint, {
      headers,
      data,
      ...options,
    });

  test('TC-001 Submit contact message with valid token returns 201', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await submitContactMessage(
      request,
      authHeaders(token, true),
      VALID_PAYLOAD
    );

    const body = await parseBody(response);
    console.log('contact message response:', JSON.stringify(body, null, 2));

    expect(response.status(), 'expected 201 Created').toBe(201);
    expect(body).toBeTruthy();

    if (typeof body.success !== 'undefined') {
      expect(body.success).toBe(true);
    }

    expect(body.message || body.data || body).toBeTruthy();
  });

  test('TC-002 Submit contact message with invalid token returns 401', async ({
    request,
  }) => {
    const response = await submitContactMessage(
      request,
      authHeaders(INVALID_TOKEN, true),
      VALID_PAYLOAD
    );

    const body = await parseBody(response);
    console.log(
      'contact message invalid token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status(), 'expected 401 Unauthorized').toBe(401);
  });

  test('TC-003 Submit contact message with missing required fields returns 422', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await submitContactMessage(
      request,
      authHeaders(token, true),
      {}
    );

    const body = await parseBody(response);
    console.log(
      'contact message validation error response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status(), 'expected 422 Unprocessable Entity').toBe(422);
    expect(body.message || body.errors || body.error).toBeTruthy();
  });

  test('TC-004 Submit contact message without token returns 401', async ({
    request,
  }) => {
    const response = await submitContactMessage(
      request,
      {
        Accept: 'application/json',
      },
      VALID_PAYLOAD
    );

    const body = await parseBody(response);
    console.log(
      'contact message without token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(401);
  });

  test('TC-005 Submit contact message with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.post(
        'https://invalid-domain-for-testing-12345.com/api/contact-messages',
        {
          data: VALID_PAYLOAD,
        }
      );
    }).rejects.toThrow();
  });

  test('TC-006 Submit contact message with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await submitContactMessage(
        request,
        authHeaders(token, true),
        VALID_PAYLOAD,
        ENDPOINT,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});