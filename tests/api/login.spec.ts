import { test, expect } from '@playwright/test';
import { generateTOTP } from '../../helpers/totp.helper';
import { setAuthToken } from '../../helpers/token.store';

const BASE_URL = 'https://hris.itmanage.com.au';

const loginAccounts = [
  {
    name: 'Automation Manager',
    email: 'manager@mailsac.com',
    password: 'Password01!',
    totpSecret: '53YLFR3WAR2HKSG5'
  }
];


for (const account of loginAccounts) {
  test(`TC-001 Successful Login + 2FA verify - ${account.name}`, async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: account.email,
        password: account.password
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    const tempToken = body.temp_token || body.data?.temp_token;
    console.log(`login body for ${account.name}:`, body);

    expect(tempToken).toBeTruthy();

    // generate 2FA code using the provided secret
    const code = generateTOTP(account.totpSecret, 6);
    console.log(`generated 2FA code for ${account.name}:`, code);

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
    console.log(`verify response body for ${account.name}:`, verifyBody);

    // persist token for use in other tests/files
    const finalToken = verifyBody?.data?.token;
    if (finalToken) {
      setAuthToken(finalToken);
      console.log(`saved auth token for ${account.name} to test-results/auth_token.json`);
    }
  });
}