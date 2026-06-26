import { test, expect } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const ENDPOINT = '/api/entities/sites/nearest';
const REQUEST_TIMEOUT = 10;

const VALID_PARAMS = {
  latitude: 1,
  longitude: 1,
};

test.describe('Nearest Sites API', () => {
  test('TC-001 Get nearest sites with valid token returns 200', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await request.get(`${BASE_URL}${ENDPOINT}`, {
      headers: {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      params: VALID_PARAMS,
    });

    const body = await parseBody(response);

    console.log(
      'get nearest sites response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(200);
    expect(body).toBeTruthy();
  });

  test('TC-002 Get nearest sites with invalid token returns 401', async ({
    request,
  }) => {
    const response = await request.get(`${BASE_URL}${ENDPOINT}`, {
      headers: {
        ...authHeaders(INVALID_TOKEN, false),
        Accept: 'application/json',
      },
      params: VALID_PARAMS,
    });

    const body = await parseBody(response);

    console.log(
      'invalid token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(401);

    if (body?.message) {
      expect(body.message).toContain('Unauthenticated');
    }
  });

  test('TC-003 Get nearest sites with missing params returns 422', async ({
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
      'validation error response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(422);
  });

  test('TC-004 Get nearest sites without token returns 401', async ({
    request,
  }) => {
    const response = await request.get(`${BASE_URL}${ENDPOINT}`, {
      headers: {
        Accept: 'application/json',
      },
      params: VALID_PARAMS,
    });

    const body = await parseBody(response);

    console.log(
      'missing token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(401);
  });

  test('TC-005 Get nearest sites with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/entities/sites/nearest'
      );
    }).rejects.toThrow();
  });

  test('TC-006 Get nearest sites with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await request.get(`${BASE_URL}${ENDPOINT}`, {
        headers: {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
        params: VALID_PARAMS,
        timeout: REQUEST_TIMEOUT,
      });
    }).rejects.toThrow();
  });
});