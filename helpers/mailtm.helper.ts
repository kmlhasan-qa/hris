import axios from 'axios';

const MAILTM_BASE_URL = 'https://api.mail.tm';

const EMAIL = 'hris001@web-library.net';
const PASSWORD = 'Password';

async function getMailTmToken(): Promise<string> {
  const response = await axios.post(`${MAILTM_BASE_URL}/token`, {
    address: EMAIL,
    password: PASSWORD
  });

  return response.data.token;
}

async function getLatestMessage(token: string) {
  const response = await axios.get(`${MAILTM_BASE_URL}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const messages = response.data['hydra:member'];

  if (!messages.length) {
    throw new Error('No emails found');
  }

  return messages[0];
}

async function getLatestMessageId(token: string): Promise<string | undefined> {
  try {
    const latestMessage = await getLatestMessage(token);
    return latestMessage.id;
  } catch (error) {
    if (error instanceof Error && error.message === 'No emails found') {
      return undefined;
    }
    throw error;
  }
}

async function getMessageContent(token: string, messageId: string) {
  const response = await axios.get(`${MAILTM_BASE_URL}/messages/${messageId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
}

export async function getLatestMailTmMessageId(): Promise<string | undefined> {
  const token = await getMailTmToken();
  return getLatestMessageId(token);
}

export async function extractOTPFromMailTm(previousMessageId?: string): Promise<string> {
  const token = await getMailTmToken();

  console.log('Logged into mail.tm');

  for (let i = 0; i < 12; i++) {
    try {
      const latestMessage = await getLatestMessage(token);

      if (previousMessageId && latestMessage.id === previousMessageId) {
        console.log('Waiting for new email...');
      } else {
        const message = await getMessageContent(token, latestMessage.id);

        const body =
          message.text || message.html?.join(' ') || '';

        console.log('Email body:', body);

        const otpMatch = body.match(/\b\d{6}\b/);

        if (otpMatch) {
          return otpMatch[0];
        }
      }
    } catch (error) {
      console.log('Waiting for email...');
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  throw new Error('OTP email not received');
}