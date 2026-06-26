import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const ENDPOINT = '/api/documents';
const REQUEST_TIMEOUT = 10;

const VALID_PARAMS = {
  page: 1,
  per_page: 20,
};

test.describe('Documents API', () => {
  const getDocuments = (
    request: APIRequestContext,
    headers: Record<string, string>,
    params: Record<string, string | number>,
    endpoint: string = `${BASE_URL}${ENDPOINT}`,
    options?: { timeout?: number }
  ) =>
    request.get(endpoint, {
      headers,
      params,
      ...options,
    });

  test('TC-001 Get documents with valid token returns 200', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await getDocuments(
      request,
      authHeaders(token, true),
      VALID_PARAMS
    );

    const body = await parseBody(response);
    console.log('documents response body:', JSON.stringify(body, null, 2));

    expect(response.status(), 'expected 200 OK').toBe(200);
    expect(body).toBeTruthy();

    if (typeof body.success !== 'undefined') {
      expect(body.success).toBe(true);
    }

    expect(body.data || body.documents || body).toBeTruthy();
  });

  test('TC-002 Get documents with invalid token returns 401 unauthorized', async ({
    request,
  }) => {
    const response = await getDocuments(
      request,
      authHeaders(INVALID_TOKEN, true),
      VALID_PARAMS
    );

    const body = await parseBody(response);
    console.log(
      'documents invalid token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status(), 'expected 401 Unauthorized').toBe(401);
  });

  test('TC-003 Get documents with invalid params returns 422 validation error', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await getDocuments(
      request,
      authHeaders(token, true),
      {
        page: '',
        per_page: '',
      }
    );

    const body = await parseBody(response);
    console.log(
      'documents validation error response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status(), 'expected 422 Unprocessable Entity').toBe(422);
    expect(body.message || body.errors || body.error).toBeTruthy();
  });

  test('TC-004 Get documents without token returns 401', async ({
    request,
  }) => {
    const response = await getDocuments(
      request,
      {
        Accept: 'application/json',
      },
      VALID_PARAMS
    );

    const body = await parseBody(response);
    console.log(
      'documents without token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(401);
  });

  test('TC-005 Get documents with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/documents',
        {
          params: VALID_PARAMS,
        }
      );
    }).rejects.toThrow();
  });

  test('TC-006 Get documents with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await getDocuments(
        request,
        authHeaders(token, true),
        VALID_PARAMS,
        `${BASE_URL}${ENDPOINT}`,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});