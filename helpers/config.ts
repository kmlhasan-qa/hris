import 'dotenv/config';

/**
 * Single source of truth for environment configuration used across the suite.
 * Every value can be overridden via an environment variable (or a local .env
 * file, loaded above) and falls back to the committed default otherwise.
 */
const env = process.env;

export const HRIS_BASE_URL = env.HRIS_BASE_URL ?? 'https://hris.itmanage.com.au';

export interface HrisLoginAccount {
  name?: string;
  email: string;
  password: string;
  totpSecret: string;
}

/** Primary automation account used by global setup and the login spec. */
export const PRIMARY_ACCOUNT: HrisLoginAccount = {
  name: 'Automation Manager',
  email: 'manager@mailsac.com',
  password: 'Newpass01234!',
  totpSecret: '53YLFR3WAR2HKSG5',
};

/** mail.tm mailbox used to retrieve password-reset OTP emails. */
export const MAILTM = {
  baseUrl: env.MAILTM_BASE_URL ?? 'https://api.mail.tm',
  email: env.MAILTM_EMAIL ?? 'hris001@web-library.net',
  password: env.MAILTM_PASSWORD ?? 'Password',
};

/** Credentials for the browser-based (UI) login flow. */
export const UI_LOGIN = {
  url: `${HRIS_BASE_URL}/login`,
  email: env.UI_EMAIL ?? 'kamal@ictechnology.com.au',
  password: env.UI_PASSWORD ?? 'Password01',
  totpSecret: env.UI_TOTP_SECRET ?? 'SQGN3PT4AEMC56BS',
};
