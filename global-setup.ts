import { loginAndSaveAuthToken } from './helpers/auth.helper';
import { PRIMARY_ACCOUNT } from './helpers/config';

export default async function globalSetup() {
  await loginAndSaveAuthToken(PRIMARY_ACCOUNT);
}
