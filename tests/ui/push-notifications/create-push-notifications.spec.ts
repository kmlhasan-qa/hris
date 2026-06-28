import { test, expect, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { PushNotificationsPage } from '../../../pages/PushNotificationsPage';
import { generateTOTP } from '../../../helpers/totp.helper';

const EMAIL       = 'kamal@ictechnology.com.au';
const PASSWORD    = 'Password01';
const TOTP_SECRET = 'SQGN3PT4AEMC56BS';
const BASE_URL    = 'https://hris.itmanage.com.au';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function livewireSettle(page: Page, ms = 0) {
  await page.waitForLoadState('networkidle');
  if (ms > 0) await page.waitForTimeout(ms);
}

async function waitUntil(fn: () => Promise<void>, timeout = 10000) {
  await expect(fn).toPass({ timeout });
}

// ─── Test ─────────────────────────────────────────────────────────────────────

test.describe('Push Notifications — Create', () => {
  test.describe.configure({ retries: 0 });

  test('TC-PN-CREATE | Create push notification suite', async ({ browser }) => {
    test.setTimeout(180_000);

    const context: BrowserContext = await browser.newContext();
    const page: Page = await context.newPage();

    try {

      // ─── Login ──────────────────────────────────────────────────────────────
      const loginPage = new LoginPage(page);
      await loginPage.goto(`${BASE_URL}/login`);
      await loginPage.emailInput().fill(EMAIL);
      await loginPage.passwordInput().fill(PASSWORD);
      await loginPage.rememberMe().check();
      await loginPage.signInButton().click();
      await expect(loginPage.otpInput()).toBeVisible();
      await loginPage.otpInput().fill(generateTOTP(TOTP_SECRET));
      await loginPage.confirmButton().click();
      await expect(loginPage.dashboardTitle()).toBeVisible({ timeout: 15000 });
      console.log('✅ Logged in successfully.');

      // ─── Navigate to Create page ─────────────────────────────────────────────
      await page.goto(`${BASE_URL}/admin/push-notifications/create`);
      await livewireSettle(page);
      console.log('✅ Navigated to Create Push Notification page.');

      // ─── Shared locators ─────────────────────────────────────────────────────
      const titleInput   = page.locator('input#form\\.title');
      const sendToAllBtn = page.locator('button[role="switch"]#form\\.send_to_all');
      const deptSelect   = page.locator('select#form\\.department');
      const siteSelect   = page.locator('select#form\\.site');
      const bodyTextarea = page.locator('textarea#form\\.body');
      const imageUpload  = page.locator('.fi-fo-file-upload');
      const submitBtn    = page.locator('button[type="submit"]', { hasText: 'Send Push Notification' });
      // Scoped to form actions container to avoid matching the image editor's Cancel button
      const cancelBtn    = page.locator('.fi-sc-actions button', { hasText: 'Cancel' });

      // ─── TC-PN-C001 | Page heading ───────────────────────────────────────────
      console.log('⏳ TC-PN-C001 | Checking page heading...');
      await expect(page.locator('h1')).toContainText('Send New Push Notification');
      console.log('✅ TC-PN-C001 | Page heading is "Send New Push Notification".');

      // ─── TC-PN-C002 | Breadcrumbs ────────────────────────────────────────────
      console.log('⏳ TC-PN-C002 | Checking breadcrumbs...');
      const breadcrumbs = page.locator('nav.fi-breadcrumbs');
      await expect(breadcrumbs).toBeVisible();
      await expect(breadcrumbs.locator('a', { hasText: 'Push Notifications' })).toBeVisible();
      await expect(breadcrumbs.locator('a', { hasText: 'Push Notifications' }))
        .toHaveAttribute('href', /push-notifications/);
      await expect(breadcrumbs.locator('span', { hasText: 'Send New Push Notification' })).toBeVisible();
      console.log('✅ TC-PN-C002 | Breadcrumbs are correct.');

      // ─── TC-PN-C003 | All form fields visible ────────────────────────────────
      console.log('⏳ TC-PN-C003 | Checking all form fields are visible...');
      await expect(titleInput).toBeVisible();
      await expect(sendToAllBtn).toBeVisible();
      await expect(deptSelect).toBeVisible();
      await expect(siteSelect).toBeVisible();
      await expect(bodyTextarea).toBeVisible();
      await expect(imageUpload).toBeVisible();
      await expect(submitBtn).toBeVisible();
      await expect(cancelBtn).toBeVisible();
      console.log('✅ TC-PN-C003 | All form fields and action buttons are visible.');

      // ─── TC-PN-C004 | Title field accepts input ───────────────────────────────
      console.log('⏳ TC-PN-C004 | Testing title input...');
      await titleInput.fill('Test Notification Title');
      await expect(titleInput).toHaveValue('Test Notification Title');
      console.log('✅ TC-PN-C004 | Title input accepts text.');

      // ─── TC-PN-C005 | Body field accepts input and shows character count ──────
      console.log('⏳ TC-PN-C005 | Testing body textarea and character counter...');
      const testBody = 'This is a test push notification message body.';
      await bodyTextarea.fill(testBody);
      // Trigger keyup so Alpine counter updates
      await bodyTextarea.dispatchEvent('keyup');
      await expect(bodyTextarea).toHaveValue(testBody);
      const charCounter = page.locator('.fi-input-charcounter');
      await expect(charCounter).toBeVisible();
      await expect(charCounter).toContainText(String(testBody.length));
      console.log(`✅ TC-PN-C005 | Body textarea accepts text; counter shows ${testBody.length} chars.`);

      // ─── TC-PN-C006 | Body field enforces 255 char limit ─────────────────────
      console.log('⏳ TC-PN-C006 | Testing 255 character limit on body...');
      const longText = 'A'.repeat(300);
      await bodyTextarea.fill(longText);
      const actualValue = await bodyTextarea.inputValue();
      expect(actualValue.length).toBeLessThanOrEqual(255);
      console.log(`✅ TC-PN-C006 | Body capped at ${actualValue.length} characters (max 255).`);

      // Reset body to valid value
      await bodyTextarea.fill(testBody);

      // ─── TC-PN-C007 | Send to All toggle ─────────────────────────────────────
      console.log('⏳ TC-PN-C007 | Testing "Send to All" toggle...');
      await expect(sendToAllBtn).toHaveAttribute('aria-checked', 'false');

      await sendToAllBtn.click();
      await livewireSettle(page, 500);
      await expect(sendToAllBtn).toHaveAttribute('aria-checked', 'true');
      console.log('✅ TC-PN-C007a | Toggle turned ON.');

      await sendToAllBtn.click();
      await livewireSettle(page, 500);
      await expect(sendToAllBtn).toHaveAttribute('aria-checked', 'false');
      console.log('✅ TC-PN-C007b | Toggle turned OFF.');

      // ─── TC-PN-C008 | Department select has options ───────────────────────────
      console.log('⏳ TC-PN-C008 | Testing Department select...');
      const deptOptions = await deptSelect.locator('option').count();
      expect(deptOptions).toBeGreaterThan(1);
      await deptSelect.selectOption({ index: 1 });
      const selectedDept = await deptSelect.inputValue();
      expect(selectedDept).not.toBe('');
      console.log(`✅ TC-PN-C008 | Department select has ${deptOptions} options; selected: "${selectedDept}".`);

      // Reset to blank
      await deptSelect.selectOption({ value: '' });

      // ─── TC-PN-C009 | Site select has options ────────────────────────────────
      console.log('⏳ TC-PN-C009 | Testing Site select...');
      const siteOptions = await siteSelect.locator('option').count();
      expect(siteOptions).toBeGreaterThan(1);
      await siteSelect.selectOption({ index: 1 });
      const selectedSite = await siteSelect.inputValue();
      expect(selectedSite).not.toBe('');
      console.log(`✅ TC-PN-C009 | Site select has ${siteOptions} options; selected: "${selectedSite}".`);

      // Reset to blank
      await siteSelect.selectOption({ value: '' });

      // ─── TC-PN-C010 | Recipients search works ────────────────────────────────
      console.log('⏳ TC-PN-C010 | Testing Recipients searchable select...');
      const recipientsBtn = page.locator('.fi-select-input-btn').first();
      await recipientsBtn.click();
      const recipientDropdown = page.locator('.fi-dropdown-panel[role="listbox"]');
      await expect(recipientDropdown).toBeVisible({ timeout: 10000 });
      const recipientSearch = recipientDropdown.locator('input[type="text"]');
      await recipientSearch.fill('Automation');
      await page.waitForTimeout(1500); // respect 1000ms searchDebounce
      await livewireSettle(page);
      const recipientOptions = page.locator('[role="option"], .fi-select-input-dropdown li');
      const optionCount = await recipientOptions.count();
      console.log(`✅ TC-PN-C010 | Recipients search returned ${optionCount} result(s) for "Automation".`);

      if (optionCount > 0) {
        await recipientOptions.first().click();
        await livewireSettle(page, 300);
        console.log('✅ TC-PN-C010b | First recipient selected.');
      }

      // Close dropdown by pressing Escape
      await page.keyboard.press('Escape');

      // ─── TC-PN-C011 | Validation — submit with empty required fields ──────────
      console.log('⏳ TC-PN-C011 | Testing validation on empty required fields...');
      await titleInput.fill('');
      await bodyTextarea.fill('');
      await submitBtn.click();
      await livewireSettle(page, 500);

      const validationModal  = page.locator('#validation-error-modal');
      const isModalVisible   = await validationModal.isVisible().catch(() => false);
      const isStillOnCreate  = page.url().includes('push-notifications/create');
      expect(isModalVisible || isStillOnCreate).toBe(true);

      if (isModalVisible) {
        const okBtn = validationModal.locator('button', { hasText: 'Ok' });
        await expect(okBtn).toBeVisible({ timeout: 5000 });
        await okBtn.click();
        await expect(validationModal).not.toBeVisible({ timeout: 5000 });
        console.log('✅ TC-PN-C011 | Validation modal appeared and was dismissed.');
      } else {
        console.log('✅ TC-PN-C011 | Form stayed on create page (HTML5 / server validation).');
      }

      // ─── TC-PN-C012 | Cancel navigates back ──────────────────────────────────
      console.log('⏳ TC-PN-C012 | Testing Cancel button...');
      await expect(cancelBtn).toBeVisible();
      await cancelBtn.click();
      // Cancel uses window.history.back() with referrer, or falls back to /admin.
      // Either way it must navigate away from the create page.
      await waitUntil(async () => {
        expect(page.url()).not.toContain('push-notifications/create');
      }, 10000);
      console.log(`✅ TC-PN-C012 | Cancel navigated away from create page to: ${page.url()}`);

      // ─── TC-PN-C013 | Successful create ──────────────────────────────────────
      console.log('⏳ TC-PN-C013 | Submitting a valid new push notification...');
      await page.goto(`${BASE_URL}/admin/push-notifications/create`);
      await livewireSettle(page);

      const uniqueTitle = `Automated Test Notification ${Date.now()}`;

      // Fill all required fields on the fresh page
      await titleInput.fill(uniqueTitle);
      await bodyTextarea.fill('Automated test notification body sent by Playwright.');

      // Send to All — avoids needing to pick recipients manually
      await sendToAllBtn.click();
      await livewireSettle(page, 500);
      await expect(sendToAllBtn).toHaveAttribute('aria-checked', 'true');

      await submitBtn.click();
      await livewireSettle(page, 1000);

      // After a successful send, Filament redirects to the list or shows a success toast.
      // Wait up to 20s for either outcome.
      await Promise.race([
        // Outcome A: redirected to list page
        expect(page).toHaveURL(/push-notifications(?!\/create)/, { timeout: 20000 }),
        // Outcome B: success notification appears on the same page
        expect(page.locator('.fi-no-notification-title, .fi-toast-notification'))
          .toBeVisible({ timeout: 20000 }),
      ]).catch(async () => {
        // If neither happened, log the current URL for debugging and fail clearly
        throw new Error(`TC-PN-C013 failed: still on ${page.url()} after submit`);
      });

      console.log(`✅ TC-PN-C013 | Notification "${uniqueTitle}" submitted successfully. URL: ${page.url()}`);

    } finally {
      await context.close();
    }
  });
});