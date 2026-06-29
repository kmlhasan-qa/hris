import { Page } from '@playwright/test';

/**
 * Filament is built on Livewire: every table interaction (search, sort, filter,
 * paginate) triggers a `POST /livewire/update` round-trip that re-renders the
 * markup server-side. Waiting on THAT response is the deterministic alternative
 * to `waitForTimeout(...)` (guessing) and `networkidle` (never settles because
 * Livewire keeps connections warm).
 *
 * Usage: wrap the action that triggers the update, then await the returned
 * promise so the assertion runs against the re-rendered DOM.
 *
 *   await waitForLivewire(page, () => locator.click());
 *
 * Degrades gracefully: if no request fires within the window, it resolves
 * instead of failing, so callers still proceed to their explicit assertions.
 */
export async function waitForLivewire(
  page: Page,
  action: () => Promise<unknown>,
  timeout = 15_000,
): Promise<void> {
  const response = page
    .waitForResponse(
      (r) => r.url().includes('/livewire/update') && r.request().method() === 'POST',
      { timeout },
    )
    .catch(() => null);

  await action();
  await response;
}
