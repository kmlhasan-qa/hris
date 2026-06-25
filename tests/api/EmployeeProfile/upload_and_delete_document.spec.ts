import { test, expect } from '@playwright/test';
import { INVALID_TOKEN, requireToken } from '../_shared';
import { uploadDocument, deleteDocument } from '../../../helpers/document.helper';
 
test('TC-001 Upload and delete document successfully', async ({ request }) => {
  const token = requireToken();

  // Upload document
  const { response: uploadResponse, body: uploadBody } =
    await uploadDocument(request, token);

  console.log(
    'upload response:',
    JSON.stringify(uploadBody, null, 2)
  );

  expect(uploadResponse.status(), 'expected 201 Created').toBe(201);

  const publicId =
    uploadBody?.data?.publicId ||
    uploadBody?.data?.public_id ||
    uploadBody?.publicId ||
    uploadBody?.public_id;

  expect(publicId, 'publicId should exist').toBeTruthy();

  // Delete document
  const { response: deleteResponse, body: deleteBody } =
    await deleteDocument(request, token, publicId);

  console.log(
    'delete response:',
    JSON.stringify(deleteBody, null, 2)
  );

  expect(deleteResponse.status(), 'expected 200 OK').toBe(200);
});

test('TC-002 Upload document with invalid token returns 401', async ({ request }) => {
  const { response, body } = await uploadDocument(
    request,
    INVALID_TOKEN
  );

  console.log(
    'invalid upload response:',
    JSON.stringify(body, null, 2)
  );

  expect(response.status(), 'expected 401 Unauthorized').toBe(401);
});

test('TC-003 Upload document with invalid payload returns 422', async ({ request }) => {
  const token = requireToken();

  const { response, body } = await uploadDocument(request, token, {
    includeName: false,
    includeDocumentType: false,
  });

  console.log(
    'validation error response:',
    JSON.stringify(body, null, 2)
  );

  expect(response.status(), 'expected 422 Validation Error').toBe(422);
});

test('TC-004 Delete document with invalid token returns 401', async ({ request }) => {
  const { response, body } = await deleteDocument(
    request,
    INVALID_TOKEN,
    'dummy-public-id'
  );

  console.log(
    'delete invalid token response:',
    JSON.stringify(body, null, 2)
  );

  expect(response.status(), 'expected 401 Unauthorized').toBe(401);
});

test('TC-005 Delete invalid document returns 404', async ({ request }) => {
  const token = requireToken();

  const { response, body } = await deleteDocument(
    request,
    token,
    'invalid-public-id'
  );

  console.log(
    'delete invalid document response:',
    JSON.stringify(body, null, 2)
  );

  expect(response.status(), 'expected 404 Not Found').toBe(404);
});