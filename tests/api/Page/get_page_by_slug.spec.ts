import { test, expect } from '@playwright/test';
import { BASE_URL, parseBody } from '../_shared';

const PAGE_ENDPOINT = '/api/pages';

test.describe('Get Page By Slug API', () => {
  test('TC-001 Get page with slug "about-us" → 200', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${PAGE_ENDPOINT}/about-us`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);

    console.log('about-us response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Page retrieved successfully');
  });

  test('TC-002 Get page with slug "terms-and-conditions" → 200', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${PAGE_ENDPOINT}/terms-and-conditions`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);

    console.log('terms-and-conditions response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Page retrieved successfully');
  });

  test('TC-003 Get page with slug "privacy-policy" → 200', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${PAGE_ENDPOINT}/privacy-policy`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);

    console.log('privacy-policy response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Page retrieved successfully');
  });

  test('TC-004 Get page with invalid slug → 404', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${PAGE_ENDPOINT}/invalid-page-slug`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const body = await parseBody(response);

    console.log('invalid slug response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(404);
    expect(body.success).toBe(false);
    expect(body.message).toContain('Page not found');
  });
});