import { Page } from '@playwright/test';

type LivewireWaitOptions = {
  timeout?: number;
  strict?: boolean;
};

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
  options: number | LivewireWaitOptions = 15_000,
): Promise<void> {
  const timeout = typeof options === 'number' ? options : (options.timeout ?? 15_000);
  const strict = typeof options === 'number' ? false : (options.strict ?? false);

  const sawResponse = page
    .waitForResponse(
      (r) => r.url().includes('/livewire/update') && r.request().method() === 'POST',
      { timeout },
    )
    .then(() => true)
    .catch(() => false);

  await action();

  if (!(await sawResponse) && strict) {
    throw new Error(`Expected Livewire update response within ${timeout}ms, but none was observed.`);
  }
}
