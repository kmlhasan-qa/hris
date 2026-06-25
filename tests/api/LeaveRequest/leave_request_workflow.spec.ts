import path from 'path';
import fs from 'fs';
import { test, expect } from '@playwright/test';
import { BASE_URL, INVALID_TOKEN, authHeaders, parseBody, requireToken } from '../_shared';

const CREATE_ENDPOINT = '/api/leave-requests';

test('TC-001 Create → Update → Delete Document → Cancel leave request workflow', async ({ request }) => {
  const token = requireToken();

  const today = new Date().toISOString().split('T')[0];

  const pdfPath = path.join(process.cwd(), 'tests/fixtures/sample.pdf');
  const fileBuffer = fs.readFileSync(pdfPath);

  // =========================
  // STEP 1: CREATE
  // =========================
  const createResponse = await request.post(`${BASE_URL}${CREATE_ENDPOINT}`, {
    headers: {
      ...authHeaders(token, false),
      Accept: 'application/json',
    },
    multipart: {
      leave_type_id: '4',
      start_date: today,
      end_date: today,
      reason: 'Automation Playwright',
      document: {
        name: 'sample.pdf',
        mimeType: 'application/pdf',
        buffer: fileBuffer,
      },
    },
  });

  const createBody = await parseBody(createResponse);

  console.log(
    'create leave request response:',
    JSON.stringify(createBody, null, 2)
  );

  expect(createResponse.status(), 'expected 201 Created').toBe(201);
  expect(createBody.success).toBe(true);
  expect(createBody.message).toContain('Leave request submitted successfully');

  const leaveRequestId = createBody?.data?.id;
  expect(leaveRequestId).toBeTruthy();

  console.log('Leave Request ID:', leaveRequestId);

  // =========================
  // STEP 2: UPDATE
  // =========================
  const updateResponse = await request.post(
    `${BASE_URL}/api/leave-requests/${leaveRequestId}/update`,
    {
      headers: {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      data: {
        leave_type_id: 4,
        start_date: today,
        end_date: today,
        reason: 'Automation Playwright Edit',
      },
    }
  );

  const updateBody = await parseBody(updateResponse);

  console.log(
    'update leave request response:',
    JSON.stringify(updateBody, null, 2)
  );

  expect(updateResponse.status(), 'expected 200 OK').toBe(200);
  expect(updateBody.success).toBe(true);
  expect(updateBody.message).toContain('Leave request updated successfully');

  // =========================
  // STEP 3: DELETE DOCUMENT
  // =========================
  const deleteDocResponse = await request.delete(
    `${BASE_URL}/api/leave-requests/${leaveRequestId}/document`,
    {
      headers: {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
    }
  );

  const deleteDocBody = await parseBody(deleteDocResponse);

  console.log(
    'delete document response:',
    JSON.stringify(deleteDocBody, null, 2)
  );

  expect(deleteDocResponse.status(), 'expected 200 OK').toBe(200);
  expect(deleteDocBody.message).toContain('Document deleted successfully');

  // =========================
  // STEP 4: CANCEL
  // =========================
  const cancelResponse = await request.post(
    `${BASE_URL}/api/leave-requests/${leaveRequestId}/cancel`,
    {
      headers: {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      data: {
        cancellation_reason: 'Automation Playwright Cancel',
      },
    }
  );

  const cancelBody = await parseBody(cancelResponse);

  console.log(
    'cancel leave request response:',
    JSON.stringify(cancelBody, null, 2)
  );

  expect(cancelResponse.status(), 'expected 200 OK').toBe(200);
});