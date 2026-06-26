import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, requireToken } from '../_shared';
import { uploadDocument, deleteDocument } from '../../../helpers/document.helper';

const REQUEST_TIMEOUT = 10;

test.describe('Profile Document API - Negative', () => {
  test('TC-001 Upload document with invalid token returns 401', async ({ request }) => {
    const { response, body } = await uploadDocument(request, INVALID_TOKEN);

    console.log('invalid upload response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-002 Upload document with invalid payload returns 422', async ({ request }) => {
    const token = requireToken();

    const { response, body } = await uploadDocument(request, token, {
      includeName: false,
      includeDocumentType: false,
    });

    console.log('validation error response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(422);
  });

  test('TC-003 Delete document with invalid token returns 401', async ({ request }) => {
    const { response, body } = await deleteDocument(
      request,
      INVALID_TOKEN,
      'dummy-public-id'
    );

    console.log('delete invalid token response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-004 Delete invalid document returns 404', async ({ request }) => {
    const token = requireToken();

    const { response, body } = await deleteDocument(
      request,
      token,
      'invalid-public-id'
    );

    console.log('delete invalid document response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(404);
  });

  test('TC-005 Upload document without token returns 401', async ({ request }) => {
    const { response, body } = await uploadDocument(request, '');

    console.log('upload without token response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-006 Delete document without token returns 401', async ({ request }) => {
    const { response, body } = await deleteDocument(
      request,
      '',
      'dummy-public-id'
    );

    console.log('delete without token response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TC-007 Upload document with unreachable host → failed to fetch', async ({ request }) => {
    await expect(async () => {
      await request.post(
        'https://invalid-domain-for-testing-12345.com/api/profile/documents'
      );
    }).rejects.toThrow();
  });

  test('TC-008 Upload document with forced timeout → failed to fetch', async ({ request }) => {
    await expect(async () => {
      await request.post(`${BASE_URL}/api/profile/documents`, {
        timeout: REQUEST_TIMEOUT,
      });
    }).rejects.toThrow();
  });
});