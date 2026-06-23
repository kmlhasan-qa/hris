import { loginAndSaveAuthToken } from './helpers/auth.helper';

const loginAccount = {
  email: 'manager@mailsac.com',
  password: 'Password01!',
  totpSecret: '53YLFR3WAR2HKSG5',
};

export default async function globalSetup() {
  await loginAndSaveAuthToken(loginAccount);
}
