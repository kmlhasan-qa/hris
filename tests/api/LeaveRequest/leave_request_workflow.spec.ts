import path from 'path';
import fs from 'fs';
import { test, expect, type APIRequestContext } from '@playwright/test';
import {
  BASE_URL,
  authHeaders,
  parseBody,
  requireToken,
} from '../_shared';

const LEAVE_ENDPOINT = '/api/leave-requests';

function getSafeFutureDate(daysAhead = 14) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);

  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }

  return date.toISOString().split('T')[0];
}

const pdfPath = path.join(process.cwd(), 'fixtures/sample.pdf');
const fileBuffer = fs.readFileSync(pdfPath);

test.describe('Leave Request Workflow API', () => {
  const createLeaveRequest = (
    request: APIRequestContext,
    token: string,
    multipart: Record<string, any>
  ) =>
    request.post(`${BASE_URL}${LEAVE_ENDPOINT}`, {
      headers: {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
      multipart,
    });

  const updateLeaveRequest = (
    request: APIRequestContext,
    token: string,
    leaveRequestId: number,
    data: Record<string, any>
  ) =>
    request.post(
      `${BASE_URL}${LEAVE_ENDPOINT}/${leaveRequestId}/update`,
      {
        headers: {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
        data,
      }
    );

  const deleteLeaveDocument = (
    request: APIRequestContext,
    token: string,
    leaveRequestId: number
  ) =>
    request.delete(
      `${BASE_URL}${LEAVE_ENDPOINT}/${leaveRequestId}/document`,
      {
        headers: {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
      }
    );

  const cancelLeaveRequest = (
    request: APIRequestContext,
    token: string,
    leaveRequestId: number,
    data: Record<string, any>
  ) =>
    request.post(
      `${BASE_URL}${LEAVE_ENDPOINT}/${leaveRequestId}/cancel`,
      {
        headers: {
          ...authHeaders(token, false),
          Accept: 'application/json',
        },
        data,
      }
    );

  test('TC-001 Create → Update → Delete Document → Cancel leave request workflow', async ({
    request,
  }) => {
    const token = requireToken();
    const leaveDate = getSafeFutureDate();

    // =========================
    // STEP 1: CREATE
    // =========================
    const createResponse = await createLeaveRequest(request, token, {
      leave_type_id: '4',
      start_date: leaveDate,
      end_date: leaveDate,
      reason: 'Automation Playwright',
      document: {
        name: 'sample.pdf',
        mimeType: 'application/pdf',
        buffer: fileBuffer,
      },
    });

    const createBody = await parseBody(createResponse);

    console.log(
      'create leave request response:',
      JSON.stringify(createBody, null, 2)
    );

    if (
      createResponse.status() === 422 &&
      createBody?.message?.includes('Leave cannot be taken on a public holiday')
    ) {
      console.log(`Workflow skipped: ${leaveDate} is a public holiday`);
      test.skip(true, `Public holiday: ${leaveDate}`);
    }

    expect(createResponse.status(), 'expected 201 Created').toBe(201);
    expect(createBody.success).toBe(true);

    const leaveRequestId = createBody?.data?.id;
    expect(leaveRequestId).toBeTruthy();

    console.log('Leave Request ID:', leaveRequestId);

    // =========================
    // STEP 2: UPDATE
    // =========================
    const updateResponse = await updateLeaveRequest(
      request,
      token,
      leaveRequestId,
      {
        leave_type_id: 4,
        start_date: leaveDate,
        end_date: leaveDate,
        reason: 'Automation Playwright Edit',
      }
    );

    const updateBody = await parseBody(updateResponse);

    console.log(
      'update leave request response:',
      JSON.stringify(updateBody, null, 2)
    );

    expect(updateResponse.status(), 'expected 200 OK').toBe(200);
    expect(updateBody.success).toBe(true);

    // =========================
    // STEP 3: DELETE DOCUMENT
    // =========================
    const deleteDocResponse = await deleteLeaveDocument(
      request,
      token,
      leaveRequestId
    );

    const deleteDocBody = await parseBody(deleteDocResponse);

    console.log(
      'delete document response:',
      JSON.stringify(deleteDocBody, null, 2)
    );

    expect(deleteDocResponse.status(), 'expected 200 OK').toBe(200);

    // =========================
    // STEP 4: CANCEL
    // =========================
    const cancelResponse = await cancelLeaveRequest(
      request,
      token,
      leaveRequestId,
      {
        cancellation_reason: 'Automation Playwright Cancel',
      }
    );

    const cancelBody = await parseBody(cancelResponse);

    console.log(
      'cancel leave request response:',
      JSON.stringify(cancelBody, null, 2)
    );

    expect(cancelResponse.status(), 'expected 200 OK').toBe(200);
  });
});