import { test, expect } from '@playwright/test';
import { requireToken } from '../_shared';
import { uploadDocument, deleteDocument } from '../../../helpers/document.helper';

test.describe('Profile Document API - E2E', () => {
  test('TC-001 Upload and delete document successfully', async ({ request }) => {
    const token = requireToken();

    const { response: uploadResponse, body: uploadBody } =
      await uploadDocument(request, token);

    console.log('upload response:', JSON.stringify(uploadBody, null, 2));

    expect(uploadResponse.status(), 'expected 201 Created').toBe(201);

    const publicId =
      uploadBody?.data?.publicId ||
      uploadBody?.data?.public_id ||
      uploadBody?.publicId ||
      uploadBody?.public_id;

    expect(publicId, 'publicId should exist').toBeTruthy();

    const { response: deleteResponse, body: deleteBody } =
      await deleteDocument(request, token, publicId);

    console.log('delete response:', JSON.stringify(deleteBody, null, 2));

    expect(deleteResponse.status(), 'expected 200 OK').toBe(200);
  });
});