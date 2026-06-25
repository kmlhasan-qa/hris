import { test, expect } from '@playwright/test';
import { PRIMARY_ACCOUNT } from '../../../helpers/config';
import { loginAndSaveAuthToken } from '../../../helpers/auth.helper';

const accounts = [PRIMARY_ACCOUNT];

test.describe('Login API', () => {
  for (const account of accounts) {
    test(`TC-001 Successful Login + 2FA verify - ${account.name}`, async () => {
      const finalToken = await loginAndSaveAuthToken(account);

      expect(finalToken).toBeTruthy();
      console.log(`saved auth token for ${account.name}`);
    });
  }
});