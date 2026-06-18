import { test, expect } from '@playwright/test';
import { generateTOTP } from '../../helpers/totp.helper';
import { setAuthToken } from '../../helpers/token.store';

const BASE_URL = 'https://hris.itmanage.com.au';


test('TC-001 Successful Login + 2FA verify', async ({ request }) => {
  const response = await request.post(`${BASE_URL}/api/auth/login`, {
    data: {
      email: 'hris24@mailsac.com',
      password: 'Password01'
    }
  });

  expect(response.status()).toBe(200);

  const body = await response.json();
  const tempToken = body.temp_token || body.data?.temp_token;
  console.log('login body:', body);

  expect(tempToken).toBeTruthy();

  // generate 2FA code using the provided secret
  const secret = 'PVKTCWTH3PJTJRT7';
  const code = generateTOTP(secret, 6);
  console.log('generated 2FA code:', code);

  const verifyResponse = await request.post(`${BASE_URL}/api/auth/2fa/verify`, {
    headers: {
      Authorization: `Bearer ${tempToken}`,
      'Content-Type': 'application/json'
    },
    data: {
      code
    }
  });

  // expect a successful 2xx response
  expect(verifyResponse.status()).toBeGreaterThanOrEqual(200);
  expect(verifyResponse.status()).toBeLessThan(300);

  const verifyBody = await verifyResponse.json().catch(() => ({}));
  console.log('verify response body:', verifyBody);

  // persist token for use in other tests/files
  const finalToken = verifyBody?.data?.token;
  if (finalToken) {
    setAuthToken(finalToken);
    console.log('saved auth token to test-results/auth_token.json');
  }
});