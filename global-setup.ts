import { loginAndSaveAuthToken } from './helpers/auth.helper';

const loginAccount = {
  email: 'hris24@mailsac.com',
  password: 'Password01',
  totpSecret: 'PVKTCWTH3PJTJRT7',
};

export default async function globalSetup() {
  await loginAndSaveAuthToken(loginAccount);
}
