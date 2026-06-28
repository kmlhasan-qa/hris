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

      await expect(loginPage.otpInput()).toBeVisible();
      await loginPage.otpInput().fill(generateTOTP(TOTP_SECRET));
      await loginPage.confirmButton().click();
      await expect(loginPage.dashboardTitle()).toBeVisible({ timeout: 15000 });
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

      // ─── TC-DASH-011 | View Leave Request link ──────────────────────────────

      await d.openNotifications();
      const viewLink = d.notificationModal
        .getByRole('link', { name: /view leave request/i })
        .first();
      await expect(viewLink).toBeVisible();
      await expect(viewLink).toHaveAttribute('href', /leave-requests/);
      await d.closeNotifications();
      console.log('✅ TC-DASH-011 | View Leave Request link is visible and correct.');

      // ─── TC-DASH-012 | Total Employees card ────────────────────────────────

      await d.assertStatCardVisible(d.totalEmployeesCard);
      const totalEmp = await d.getStatCardValue(d.totalEmployeesCard);
      expect(totalEmp).toBeGreaterThanOrEqual(0);
      console.log(`✅ TC-DASH-012 | Total Employees: ${totalEmp}`);

      // ─── TC-DASH-013 | New Hires card ───────────────────────────────────────

      await d.assertStatCardVisible(d.newHiresCard);
      const newHires = await d.getStatCardValue(d.newHiresCard);
      expect(newHires).toBeGreaterThanOrEqual(0);
      console.log(`✅ TC-DASH-013 | New Hires (30 Days): ${newHires}`);

      // ─── TC-DASH-014 | Total Employees card href ───────────────────────────

      const totalEmpHref = await d.getStatCardHref('Total Employees');
      expect(totalEmpHref).toMatch(/employees/);
      console.log('✅ TC-DASH-014 | Total Employees card href points to employees.');

      // ─── TC-DASH-015 | New Hires card href ─────────────────────────────────

      const newHiresHref = await d.getStatCardHref('New Hires');
      expect(newHiresHref).toMatch(/employees.*created_at/);
      console.log('✅ TC-DASH-015 | New Hires card href includes created_at filter.');

      // ─── TC-DASH-016 | Today's Attendance card ─────────────────────────────

      await d.assertStatCardVisible(d.todayAttendanceCard);
      const todayAtt = await d.getStatCardValue(d.todayAttendanceCard);
      expect(todayAtt).toBeGreaterThanOrEqual(0);
      console.log(`✅ TC-DASH-016 | Today's Attendance: ${todayAtt}`);

      // ─── TC-DASH-017 | Late Today card ─────────────────────────────────────

      await d.assertStatCardVisible(d.lateTodayCard);
      console.log('✅ TC-DASH-017 | Late Today card is visible.');

      // ─── TC-DASH-018 | Absent Today card ───────────────────────────────────

      await d.assertStatCardVisible(d.absentTodayCard);
      const absentToday = await d.getStatCardValue(d.absentTodayCard);
      expect(absentToday).toBeGreaterThanOrEqual(0);
      console.log(`✅ TC-DASH-018 | Absent Today: ${absentToday}`);

      // ─── TC-DASH-019 | On Leave Today card ─────────────────────────────────

      await d.assertStatCardVisible(d.onLeaveTodayCard);
      console.log('✅ TC-DASH-019 | On Leave Today card is visible.');

      // ─── TC-DASH-020 | Different Site card ─────────────────────────────────

      await d.assertStatCardVisible(d.differentSiteCard);
      console.log('✅ TC-DASH-020 | Different Site card is visible.');

      // ─── TC-DASH-021 | Open Attendances card ───────────────────────────────

      await d.assertStatCardVisible(d.openAttendancesCard);
      console.log('✅ TC-DASH-021 | Open Attendances card is visible.');

      // ─── TC-DASH-022 | Today's Attendance card href ────────────────────────

      const todayAttHref = await d.getStatCardHref("Today's Attendance");
      expect(todayAttHref).toMatch(/employee-attendances.*attendance_date_range/);
      console.log("✅ TC-DASH-022 | Today's Attendance card href includes date range filter.");

      // ─── TC-DASH-023 | Absent Today card href ──────────────────────────────

      const absentHref = await d.getStatCardHref('Absent Today');
      expect(absentHref).toMatch(/employees.*today_absent/);
      console.log('✅ TC-DASH-023 | Absent Today card href includes today_absent filter.');

      // ─── TC-DASH-026 | Sidebar ──────────────────────────────────────────────

      await expect(d.sidebar).toBeVisible();
      console.log('✅ TC-DASH-026 | Sidebar is visible.');

      // ─── TC-DASH-027 | Active sidebar item ─────────────────────────────────

      await expect(d.activeSidebarItem).toBeVisible();
      await expect(d.activeSidebarItem).toContainText('Dashboard');
      console.log('✅ TC-DASH-027 | Dashboard sidebar item is active.');

      // ─── TC-DASH-028 | Leave Management group ──────────────────────────────

      await expect(d.leaveManagementGroup).toBeVisible();
      console.log('✅ TC-DASH-028 | Leave Management group is in the sidebar.');

      // ─── TC-DASH-029 | Employees sidebar link ──────────────────────────────

      await d.navigateToEmployees();
      await expect(page).toHaveURL(/admin\/employees/);
      console.log('✅ TC-DASH-029 | Navigated to Employees page via sidebar.');
      await d.goto();

      // ─── TC-DASH-030 | Leave Requests sidebar link ─────────────────────────

      await d.navigateToLeaveRequests();
      await expect(page).toHaveURL(/admin\/leave-requests/);
      console.log('✅ TC-DASH-030 | Navigated to Leave Requests page via sidebar.');
      await d.goto();

      // ─── TC-DASH-031 | User avatar trigger ─────────────────────────────────

      await expect(d.userMenuTrigger).toBeVisible();
      console.log('✅ TC-DASH-031 | User avatar trigger is visible.');

      // ─── TC-DASH-032 | User menu dropdown ──────────────────────────────────

      await d.openUserMenu();
      await expect(d.profileLink).toBeVisible();
      await expect(d.signOutBtn).toBeVisible();
      console.log('✅ TC-DASH-032 | User menu dropdown shows Profile and Sign out.');
      await page.keyboard.press('Escape');

      // ─── TC-DASH-033 | Profile link ─────────────────────────────────────────

      await d.navigateToProfile();
      await expect(page).toHaveURL(/admin\/profile/);
      console.log('✅ TC-DASH-033 | Navigated to Profile page via user menu.');
      await d.goto();

      // ─── TC-DASH-034 | Sign out ─────────────────────────────────────────────

      await d.signOut();
      await expect(page).toHaveURL(/login/, { timeout: 8000 });
      console.log('✅ TC-DASH-034 | Signed out and redirected to login page.');

    } finally {
      await context.close();
    }
  });
});