import path from 'path';
import fs from 'fs';
import { APIRequestContext } from '@playwright/test';
import { BASE_URL, authHeaders, parseBody } from '../tests/api/_shared';

const ENDPOINT = '/api/profile/documents';

export async function uploadDocument(
  request: APIRequestContext,
  token: string,
  options?: {
    includeName?: boolean;
    includeDocumentType?: boolean;
    includeFile?: boolean;
  }
) {
  const {
    includeName = true,
    includeDocumentType = true,
    includeFile = true,
  } = options || {};

  const multipart: any = {};

  if (includeFile) {
    const pdfPath = path.resolve(__dirname, '../fixtures/sample.pdf');
    const fileBuffer = fs.readFileSync(pdfPath);

    multipart.document = {
      name: 'sample.pdf',
      mimeType: 'application/pdf',
      buffer: fileBuffer,
    };
  }

  if (includeName) {
    multipart.name = 'Automation Playwright';
  }

  if (includeDocumentType) {
    multipart.document_type = 'Certificate';
  }

  const response = await request.post(`${BASE_URL}${ENDPOINT}`, {
    headers: {
      ...authHeaders(token, false),
      Accept: 'application/json',
    },
    multipart,
  });

  const body = await parseBody(response);

  return { response, body };
}

export async function deleteDocument(
  request: APIRequestContext,
  token: string,
  publicId: string
) {
  const response = await request.delete(
    `${BASE_URL}${ENDPOINT}/${publicId}`,
    {
      headers: {
        ...authHeaders(token, false),
        Accept: 'application/json',
      },
    }
  );

  const body = await parseBody(response);

  return { response, body };
}