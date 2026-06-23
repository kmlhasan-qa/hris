import axios, { type AxiosInstance } from 'axios';
import { MAILTM } from './config';

/** Authenticate against mail.tm and return a client with the bearer token attached. */
async function authedClient(): Promise<AxiosInstance> {
  const { data } = await axios.post(`${MAILTM.baseUrl}/token`, {
    address: MAILTM.email,
    password: MAILTM.password,
  });
  return axios.create({
    baseURL: MAILTM.baseUrl,
    headers: { Authorization: `Bearer ${data.token}` },
  });
}

/** Return the most recent message in the inbox, or null when it is empty. */
async function fetchLatestMessage(client: AxiosInstance): Promise<any | null> {
  const { data } = await client.get('/messages');
  return data['hydra:member']?.[0] ?? null;
}

/** Id of the newest message currently in the inbox (used as a "before" marker). */
export async function getLatestMailTmMessageId(): Promise<string | undefined> {
  const client = await authedClient();
  const latest = await fetchLatestMessage(client);
  return latest?.id;
}

/** Poll the inbox for a new email and extract the first 6-digit OTP it contains. */
export async function extractOTPFromMailTm(
  previousMessageId?: string,
  { attempts = 12, intervalMs = 5000 }: { attempts?: number; intervalMs?: number } = {},
): Promise<string> {
  const client = await authedClient();
  console.log('Logged into mail.tm');

  for (let i = 0; i < attempts; i++) {
    try {
      const latest = await fetchLatestMessage(client);
      if (latest && latest.id !== previousMessageId) {
        const { data: message } = await client.get(`/messages/${latest.id}`);
        const body = message.text || message.html?.join(' ') || '';
        console.log('Email body:', body);

        const otpMatch = body.match(/\b\d{6}\b/);
        if (otpMatch) return otpMatch[0];
      } else {
        console.log('Waiting for new email...');
      }
    } catch {
      console.log('Waiting for email...');
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('OTP email not received');
}
