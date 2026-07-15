import { loginAndSaveAuthToken } from './helpers/auth.helper';
import { PRIMARY_ACCOUNT } from './helpers/config';

export default async function SetupAPI() {
  const token = await loginAndSaveAuthToken(PRIMARY_ACCOUNT);

  if (!token) {
    throw new Error(
      'Global setup failed: auth token unavailable. Check API credentials and 2FA secret in environment configuration.'
    );
  }
}