import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const ENDPOINT = '/api/profile/avatar';

const avatarPath = path.resolve(__dirname, '../../fixtures/avatar.jpg');
const invalidFilePath = path.resolve(__dirname, '../../fixtures/invalid.txt');

test('TC-001 Upload avatar with valid token returns 200', async ({ request }) => {
  const token = requireToken();

  const response = await request.post(`${BASE_URL}${ENDPOINT}`, {
    headers: {
      ...authHeaders(token, false),
      Accept: 'application/json',
    },
    multipart: {
      avatar: {
        name: 'avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: fs.readFileSync(avatarPath),
      },
    },
  });

  const body = await parseBody(response);
  console.log('avatar upload response:', JSON.stringify(body, null, 2));

  expect(response.status(), 'expected 200 OK').toBe(200);
  expect(body).toBeTruthy();
});

test('TC-002 Upload avatar with invalid token returns 401', async ({ request }) => {
  const response = await request.post(`${BASE_URL}${ENDPOINT}`, {
    headers: {
      ...authHeaders(INVALID_TOKEN, false),
      Accept: 'application/json',
    },
    multipart: {
      avatar: {
        name: 'avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: fs.readFileSync(avatarPath),
      },
    },
  });

  const body = await parseBody(response);
  console.log('avatar invalid token response:', JSON.stringify(body, null, 2));

  expect(response.status(), 'expected 401 Unauthorized').toBe(401);
});

test('TC-003 Upload avatar with invalid file returns 422', async ({ request }) => {
  const token = requireToken();

  const response = await request.post(`${BASE_URL}${ENDPOINT}`, {
    headers: {
      ...authHeaders(token, false),
      Accept: 'application/json',
    },
    multipart: {
      avatar: {
        name: 'invalid.txt',
        mimeType: 'text/plain',
        buffer: fs.readFileSync(invalidFilePath),
      },
    },
  });

  const body = await parseBody(response);
  console.log('avatar validation error response:', JSON.stringify(body, null, 2));

  expect(response.status(), 'expected 422 Unprocessable Entity').toBe(422);
  expect(body.message || body.errors || body.error).toBeTruthy();
});