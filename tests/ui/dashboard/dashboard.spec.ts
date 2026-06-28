import { test, expect, Page, BrowserContext } from '@playwright/test';
import { DashboardPage } from '../../../pages/DashboardPage';
import { LoginPage } from '../../../pages/LoginPage';
import { generateTOTP } from '../../../helpers/totp.helper';

const EMAIL = 'kamal@ictechnology.com.au';
const PASSWORD = 'Password01';
const TOTP_SECRET = 'SQGN3PT4AEMC56BS';

test.describe('Dashboard', () => {
  test.describe.configure({ retries: 0 });

  test('TC-DASH | Full dashboard test suite', async ({ browser }) => {
    test.setTimeout(180_000); // 3 min for CI

    const context: BrowserContext = await browser.newContext();
    const page: Page = await context.newPage();

    try {
      // ─── Login ─────────────────────────────────────────────────────────────

      const loginPage = new LoginPage(page);
      await loginPage.goto('https://hris.itmanage.com.au/login');

      await loginPage.emailInput().fill(EMAIL);
      await loginPage.passwordInput().fill(PASSWORD);
      await loginPage.rememberMe().check();
      await loginPage.signInButton().click();

      await expect(loginPage.otpInput()).toBeVisible({ timeout: 15000 });
      await loginPage.otpInput().fill(generateTOTP(TOTP_SECRET));

      await Promise.all([
        page.waitForURL(/.*dashboard|.*admin/, { timeout: 30000 }),
        loginPage.confirmButton().click(),
      ]);

      await page.waitForLoadState('networkidle');

      console.log('Current URL after login:', page.url());
      await page.screenshot({ path: 'after-login.png', fullPage: true });

      await expect(loginPage.dashboardTitle()).toBeVisible({ timeout: 30000 });
      console.log('✅ Logged in successfully.');

      const d = new DashboardPage(page);

      // ─── TC-DASH-001 | Page load & heading ─────────────────────────────────
      await d.assertOnDashboard();
      console.log('✅ TC-DASH-001 | Dashboard page loaded successfully.');

      // ─── TC-DASH-003 | Search input ─────────────────────────────────────────
      await expect(d.searchInput).toBeVisible();
      await d.fillSearch('test');
      await expect(d.searchInput).toHaveValue('test');
      await d.clearSearch();
      await expect(d.searchInput).toHaveValue('');
      console.log('✅ TC-DASH-003 | Search input is functional.');

      // ─── TC-DASH-004 | Notification badge ──────────────────────────────────
      await expect(d.notificationBadge).toBeVisible();
      const badgeCount = await d.getNotificationBadgeCount();
      expect(badgeCount).toBeGreaterThan(0);
      console.log(`✅ TC-DASH-004 | Notification badge shows ${badgeCount} unread.`);

      // ─── TC-DASH-005 | Open notifications modal ─────────────────────────────
      await d.openNotifications();
      await d.assertNotificationModalOpen();
      console.log('✅ TC-DASH-005 | Notifications modal opened successfully.');

      // ─── TC-DASH-006 | Notification items ──────────────────────────────────
      const notifCount = await d.getNotificationItemCount();
      expect(notifCount).toBeGreaterThan(0);
      console.log(`✅ TC-DASH-006 | Notifications modal shows ${notifCount} items.`);

      // ─── TC-DASH-007 | Mark all as read button ──────────────────────────────
      await expect(d.notificationMarkAllReadBtn).toBeVisible();
      console.log('✅ TC-DASH-007 | Mark all as read button is visible.');

      // ─── TC-DASH-008 | Clear button ─────────────────────────────────────────
      await expect(d.notificationClearBtn).toBeVisible();
      console.log('✅ TC-DASH-008 | Clear button is visible.');

      // ─── TC-DASH-009 | Next pagination ──────────────────────────────────────
      await expect(d.notificationNextBtn).toBeVisible();
      await d.goToNextNotificationPage();
      const nextPageCount = await d.getNotificationItemCount();
      expect(nextPageCount).toBeGreaterThan(0);
      console.log('✅ TC-DASH-009 | Next pagination loaded more notifications.');

      // ─── TC-DASH-010 | Close notifications modal ────────────────────────────
      await d.closeNotifications();
      await d.assertNotificationModalClosed();
      console.log('✅ TC-DASH-010 | Notifications modal closed successfully.');

      // Continue with remaining test steps unchanged...
      // TC-DASH-011 until TC-DASH-034 remain same as your existing code

    } finally {
      try {
        await context.close();
      } catch (error) {
        console.log('Context already closed.');
      }
    }
  });
});