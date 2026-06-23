import { test, expect } from '@playwright/test';
import { generateTOTP } from '../../helpers/totp.helper';
import { setAuthToken } from '../../helpers/token.store';
import { PRIMARY_ACCOUNT } from '../../helpers/config';
import { BASE_URL, authHeaders, parseBody } from './_shared';

const loginAccounts = [PRIMARY_ACCOUNT];

for (const account of loginAccounts) {
  test(`TC-001 Successful Login + 2FA verify - ${account.name}`, async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: account.email, password: account.password },
    });
    expect(loginResponse.status()).toBe(200);

    const loginBody = await loginResponse.json();
    const tempToken = loginBody.temp_token || loginBody.data?.temp_token;
    console.log(`login body for ${account.name}:`, loginBody);
    expect(tempToken).toBeTruthy();

    // Generate the 2FA code from the shared secret and verify it.
    const code = generateTOTP(account.totpSecret, 6);
    console.log(`generated 2FA code for ${account.name}:`, code);

    const verifyResponse = await request.post(`${BASE_URL}/api/auth/2fa/verify`, {
      headers: authHeaders(tempToken, true),
      data: { code },
    });
    expect(verifyResponse.status()).toBeGreaterThanOrEqual(200);
    expect(verifyResponse.status()).toBeLessThan(300);

    const verifyBody = await parseBody(verifyResponse);
    console.log(`verify response body for ${account.name}:`, verifyBody);

    // Persist the final token for use by the other specs.
    const finalToken = verifyBody?.data?.token;
    if (finalToken) {
      setAuthToken(finalToken);
      console.log(`saved auth token for ${account.name} to test-results/auth_token.json`);
    }
  });
}
