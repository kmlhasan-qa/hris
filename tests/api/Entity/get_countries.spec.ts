import { test, expect } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const ENDPOINT = '/api/entities/countries';
const REQUEST_TIMEOUT = 10;

test.describe('Countries API', () => {
  test('TC-001 Get countries with valid token returns 200', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await request.get(`${BASE_URL}${ENDPOINT}`, {
      headers: {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
    });

    const body = await parseBody(response);

    console.log(
      'get countries response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(200);
    expect(body).toBeTruthy();

    if (Array.isArray(body)) {
      expect(body.length).toBeGreaterThan(0);
    }

    if (body?.data && Array.isArray(body.data)) {
      expect(body.data.length).toBeGreaterThan(0);
    }
  });

  test('TC-002 Get countries with invalid token returns 401', async ({
    request,
  }) => {
    const response = await request.get(`${BASE_URL}${ENDPOINT}`, {
      headers: {
        ...authHeaders(INVALID_TOKEN, false),
        Accept: 'application/json',
      },
    });

    const body = await parseBody(response);

    console.log(
      'invalid token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(401);
  });

  test('TC-003 Get countries without token returns 401', async ({
    request,
  }) => {
    const response = await request.get(`${BASE_URL}${ENDPOINT}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    const body = await parseBody(response);

    console.log(
      'missing token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(401);
  });

  test('TC-004 Get countries with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/entities/countries'
      );
    }).rejects.toThrow();
  });

  test('TC-005 Get countries with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await request.get(`${BASE_URL}${ENDPOINT}`, {
        headers: {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
        timeout: REQUEST_TIMEOUT,
      });
    }).rejects.toThrow();
  });
});