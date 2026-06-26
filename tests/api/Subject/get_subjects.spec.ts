import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const SUBJECTS_ENDPOINT = '/api/subjects';
const REQUEST_TIMEOUT = 10;

test.describe('Subjects API', () => {
  const getSubjects = (
    request: APIRequestContext,
    headers: Record<string, string>,
    endpoint: string = `${BASE_URL}${SUBJECTS_ENDPOINT}`,
    options?: { timeout?: number }
  ) =>
    request.get(endpoint, {
      headers,
      ...options,
    });

  test('TC-001 Get subjects with valid token → 200', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await getSubjects(request, {
      ...authHeaders(token),
      Accept: 'application/json',
    });

    const body = await parseBody(response);

    console.log('subjects response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Subjects retrieved successfully');
  });

  test('TC-002 Get subjects without token → 401', async ({
    request,
  }) => {
    const response = await getSubjects(request, {
      Accept: 'application/json',
    });

    const body = await parseBody(response);

    console.log('401 no token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-003 Get subjects with invalid token → 401', async ({
    request,
  }) => {
    const response = await getSubjects(request, {
      Authorization: `Bearer ${INVALID_TOKEN}`,
      Accept: 'application/json',
    });

    const body = await parseBody(response);

    console.log('401 invalid token:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-004 Get subjects with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/subjects'
      );
    }).rejects.toThrow();
  });

  test('TC-005 Get subjects with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await getSubjects(
        request,
        {
          ...authHeaders(token),
          Accept: 'application/json',
        },
        `${BASE_URL}${SUBJECTS_ENDPOINT}`,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});