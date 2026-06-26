import { test, expect, type APIRequestContext } from '@playwright/test';
import { BASE_URL, parseBody } from '../_shared';

const PAGE_ENDPOINT = '/api/pages';
const REQUEST_TIMEOUT = 10;

const VALID_SLUGS = [
  'about-us',
  'terms-and-conditions',
  'privacy-policy',
];

const INVALID_SLUG = 'invalid-page-slug';

test.describe('Get Page By Slug API', () => {
  const getPageBySlug = (
    request: APIRequestContext,
    slug: string,
    endpoint?: string,
    options?: { timeout?: number }
  ) =>
    request.get(
      endpoint ?? `${BASE_URL}${PAGE_ENDPOINT}/${slug}`,
      {
        headers: {
          Accept: 'application/json',
        },
        ...options,
      }
    );

  VALID_SLUGS.forEach((slug, index) => {
    test(`TC-00${index + 1} Get page with slug "${slug}" → 200`, async ({
      request,
    }) => {
      const response = await getPageBySlug(request, slug);
      const body = await parseBody(response);

      console.log(`${slug} response:`, JSON.stringify(body, null, 2));

      expect(response.status()).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Page retrieved successfully');
    });
  });

  test('TC-004 Get page with invalid slug → 404', async ({ request }) => {
    const response = await getPageBySlug(request, INVALID_SLUG);
    const body = await parseBody(response);

    console.log('invalid slug response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(404);
    expect(body.success).toBe(false);
    expect(body.message).toContain('Page not found');
  });

  test('TC-005 Get page with unreachable host → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await request.get(
        'https://invalid-domain-for-testing-12345.com/api/pages/about-us'
      );
    }).rejects.toThrow();
  });

  test('TC-006 Get page with forced timeout → failed to fetch', async ({
    request,
  }) => {
    await expect(async () => {
      await getPageBySlug(
        request,
        'about-us',
        `${BASE_URL}${PAGE_ENDPOINT}/about-us`,
        { timeout: REQUEST_TIMEOUT }
      );
    }).rejects.toThrow();
  });
});