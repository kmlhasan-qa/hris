import { test, expect, type APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import {
  BASE_URL,
  INVALID_TOKEN,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const ENDPOINT = '/api/profile/avatar';
const REQUEST_TIMEOUT = 10;

const avatarPath = path.resolve(__dirname, '../../../fixtures/avatar.jpg');
const invalidFilePath = path.resolve(__dirname, '../../../fixtures/invalid.txt');

test.describe('Upload Avatar API', () => {
  const uploadAvatar = (
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

  const validAvatarMultipart = {
    avatar: {
      name: 'avatar.jpg',
      mimeType: 'image/jpeg',
      buffer: fs.readFileSync(avatarPath),
    },
  };

  const invalidAvatarMultipart = {
    avatar: {
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: fs.readFileSync(invalidFilePath),
    },
  };

  test('TC-001 Upload avatar with valid token returns 200', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await uploadAvatar(
      request,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      validAvatarMultipart
    );

    const body = await parseBody(response);
    console.log('avatar upload response:', JSON.stringify(body, null, 2));

    expect(response.status(), 'expected 200 OK').toBe(200);
    expect(body).toBeTruthy();
  });

  test('TC-002 Upload avatar with invalid token returns 401', async ({
    request,
  }) => {
    const response = await uploadAvatar(
      request,
      {
        ...authHeaders(INVALID_TOKEN, false),
        Accept: 'application/json',
      },
      validAvatarMultipart
    );

    const body = await parseBody(response);
    console.log(
      'avatar invalid token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status(), 'expected 401 Unauthorized').toBe(401);
  });

  test('TC-003 Upload avatar with invalid file returns 422', async ({
    request,
  }) => {
    const token = requireToken();

    const response = await uploadAvatar(
      request,
      {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      invalidAvatarMultipart
    );

    const body = await parseBody(response);
    console.log(
      'avatar validation error response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status(), 'expected 422 Unprocessable Entity').toBe(422);
    expect(body.message || body.errors || body.error).toBeTruthy();
  });

  test('TC-004 Upload avatar without token returns 401', async ({
    request,
  }) => {
    const response = await uploadAvatar(
      request,
      {
        Accept: 'application/json',
      },
      validAvatarMultipart
    );

    const body = await parseBody(response);
    console.log(
      'avatar without token response:',
      JSON.stringify(body, null, 2)
    );

    expect(response.status()).toBe(401);
  });

  test('TC-005 Upload avatar with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.post(
        'https://invalid-domain-for-testing-12345.com/api/profile/avatar'
      );
    }).rejects.toThrow();
  });

  test('TC-006 Upload avatar with forced timeout → failed to fetch', async ({
    request,
  }) => {
    const token = requireToken();

    await expect(async () => {
      await uploadAvatar(
        request,
        {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
        validAvatarMultipart,
        `${BASE_URL}${ENDPOINT}`,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});