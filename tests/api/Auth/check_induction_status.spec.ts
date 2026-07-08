import { test, expect, type APIRequestContext } from '@playwright/test';
import { assertSuccessOrError } from '../_shared';

test.describe('Check Induction Status API', () => {
  const ENDPOINT = '/api/auth/check-induction';

  const VALID_PAYLOAD = {
    email: 'induction02@mailsac.com',
    password: 'Password',
  };

  async function checkInductionStatus(
    request: APIRequestContext,
    payload: Record<string, any>
  ) {
    return request.post(ENDPOINT, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: payload,
    });
  }

  test('TC-001 Check induction status with valid credentials returns 200', async ({
    request,
  }) => {
    const response = await checkInductionStatus(request, VALID_PAYLOAD);

    expect(response.status()).toBe(200);

    const body = await assertSuccessOrError(response);
    console.log('Check induction response:', body);
  });

  test('TC-002 Check induction status with invalid credentials returns 401', async ({
    request,
  }) => {
    const response = await checkInductionStatus(request, {
      email: 'induction02@mailsac.com',
      password: 'WrongPassword',
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    console.log('Unauthorized response:', body);
  });

  test('TC-003 Check induction status with invalid request body returns 422', async ({
    request,
  }) => {
    const response = await checkInductionStatus(request, {
      email: '',
      password: '',
    });

    expect(response.status()).toBe(422);

    const body = await response.json();
    console.log('Validation error response:', body);
  });
});