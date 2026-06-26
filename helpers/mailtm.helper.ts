import axios, { type AxiosInstance } from 'axios';
import { MAILTM } from './config';

type MailTmMessage = {
  id: string;
};

const OTP_REGEX = /\b\d{6}\b/;

const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

async function authedClient(): Promise<AxiosInstance> {
  const { data } = await axios.post(`${MAILTM.baseUrl}/token`, {
    address: MAILTM.email,
    password: MAILTM.password,
  });

  return axios.create({
    baseURL: MAILTM.baseUrl,
    headers: {
      Authorization: `Bearer ${data.token}`,
    },
  });
}

async function fetchLatestMessage(
  client: AxiosInstance
): Promise<MailTmMessage | null> {
  const { data } = await client.get('/messages');
  return data['hydra:member']?.[0] ?? null;
}

export async function getLatestMailTmMessageId(): Promise<string | undefined> {
  const client = await authedClient();
  const latest = await fetchLatestMessage(client);
  return latest?.id;
}

export async function extractOTPFromMailTm(
  previousMessageId?: string,
  { attempts = 3, intervalMs = 5000 }: { attempts?: number; intervalMs?: number } = {},
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

        const otpMatch = body.match(OTP_REGEX);

        if (otpMatch) {
          return otpMatch[0];
        }
      } else {
        console.log(`Waiting for new email... attempt ${i + 1}/${attempts}`);
      }
    } catch (error: any) {
      console.log('Mail.tm polling error:', error?.message ?? error);
    }

    await sleep(intervalMs);
  }

  throw new Error('OTP email not received');
}