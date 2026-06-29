import { loginAndSaveAuthToken } from './helpers/auth.helper';
import { PRIMARY_ACCOUNT } from './helpers/config';

export default async function SetupAPI() {
  try {
    const token = await loginAndSaveAuthToken(PRIMARY_ACCOUNT);

    if (!token) {
      console.log('Global setup: auth token unavailable.');
    }
  } catch (error) {
    console.log('Global setup failed:', error);
  }
}