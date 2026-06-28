import { type Page, type Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly url: string;

  // ─── Topbar ───────────────────────────────────────────────────────────────
  readonly logo: Locator;
  readonly searchInput: Locator;
  readonly notificationBellBtn: Locator;
  readonly notificationBadge: Locator;
  readonly userMenuTrigger: Locator;

  // ─── Notification modal ───────────────────────────────────────────────────
  readonly notificationModal: Locator;
  readonly notificationModalHeading: Locator;
  readonly notificationModalCloseBtn: Locator;
  readonly notificationMarkAllReadBtn: Locator;
  readonly notificationClearBtn: Locator;
  readonly notificationNextBtn: Locator;
  readonly notificationItems: Locator;

  // ─── Page heading ─────────────────────────────────────────────────────────
  readonly pageHeading: Locator;

  // ─── Employee stats widget ────────────────────────────────────────────────
  readonly totalEmployeesCard: Locator;
  readonly newHiresCard: Locator;

  // ─── Attendance stats widget ──────────────────────────────────────────────
  readonly todayAttendanceCard: Locator;
  readonly lateTodayCard: Locator;
  readonly absentTodayCard: Locator;
  readonly onLeaveTodayCard: Locator;
  readonly differentSiteCard: Locator;
  readonly openAttendancesCard: Locator;

  // ─── Newsletter widget ────────────────────────────────────────────────────
  readonly latestNewsWidget: Locator;
  readonly latestNewsLink: Locator;

  // ─── Sidebar ──────────────────────────────────────────────────────────────
  readonly sidebar: Locator;
  readonly activeSidebarItem: Locator;
  readonly leaveManagementGroup: Locator;
  readonly employeesLink: Locator;
  readonly leaveRequestsLink: Locator;

  // ─── User menu dropdown ───────────────────────────────────────────────────
  readonly profileLink: Locator;
  readonly signOutBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.url = 'https://hris.itmanage.com.au/admin';

    // Topbar
    // NOTE: Filament renders two logo elements (collapsed + expanded sidebar states).
    // Use a locator that targets the visible one at assertion time rather than .first().
    this.logo = page.locator('img[alt="TalentraSuite logo"]').filter({ visible: true }).first();
    this.searchInput = page.getByPlaceholder('Search');
    this.notificationBellBtn = page.locator('[aria-label="Notifications"]').first();
    this.notificationBadge = page
      .locator('.fi-topbar-database-notifications-btn .fi-badge')
      .first();
    this.userMenuTrigger = page.locator('.fi-user-menu-trigger');

    // Notification modal
    // NOTE: Alpine.js (x-show) keeps this element in the DOM but toggles display:none.
    // Locators here are fine — the key is using waitForAlpineVisible() before asserting.
    this.notificationModal = page
      .locator('[role="dialog"]#database-notifications');
    this.notificationModalHeading = this.notificationModal.getByRole('heading', {
      name: 'Notifications',
    });
    this.notificationModalCloseBtn = this.notificationModal.getByRole('button', {
      name: /close/i,
    });
    this.notificationMarkAllReadBtn = this.notificationModal.getByRole('button', {
      name: /mark all as read/i,
    });
    this.notificationClearBtn = this.notificationModal.getByRole('button', {
      name: /clear/i,
    });
    this.notificationNextBtn = this.notificationModal.getByRole('button', {
      name: /next/i,
    });
    this.notificationItems = this.notificationModal.locator('.fi-no-notification');

    // Page heading
    this.pageHeading = page.getByRole('heading', { name: 'Dashboard' });

    // Employee stats widget
    this.totalEmployeesCard = page
      .locator('.fi-wi-stats-overview-stat')
      .filter({ hasText: 'Total Employees' });
    this.newHiresCard = page
      .locator('.fi-wi-stats-overview-stat')
      .filter({ hasText: 'New Hires (30 Days)' });

    // Attendance stats widget
    this.todayAttendanceCard = page
      .locator('.fi-wi-stats-overview-stat')
      .filter({ hasText: "Today's Attendance" });
    this.lateTodayCard = page
      .locator('.fi-wi-stats-overview-stat')
      .filter({ hasText: 'Late Today' });
    this.absentTodayCard = page
      .locator('.fi-wi-stats-overview-stat')
      .filter({ hasText: 'Absent Today' });
    this.onLeaveTodayCard = page
      .locator('.fi-wi-stats-overview-stat')
      .filter({ hasText: 'On Leave Today' });
    this.differentSiteCard = page
      .locator('.fi-wi-stats-overview-stat')
      .filter({ hasText: 'Different Site' });
    this.openAttendancesCard = page
      .locator('.fi-wi-stats-overview-stat')
      .filter({ hasText: 'Open Attendances' });

    // Newsletter widget
    this.latestNewsWidget = page
      .locator('.fi-wi-widget')
      .filter({ hasText: 'Latest News' })
      .first();
    this.latestNewsLink = page.locator('[href*="newsletters"]').first();

    // Sidebar
    this.sidebar = page.locator('.fi-sidebar');
    this.activeSidebarItem = page.locator('.fi-sidebar-item.fi-active');
    this.leaveManagementGroup = page.locator('[data-group-label="Leave Management"]');
    this.employeesLink = page
      .locator('.fi-sidebar a[href*="/admin/employees"]')
      .first();
    this.leaveRequestsLink = page
      .locator('.fi-sidebar a[href*="/admin/leave-requests"]')
      .first();

    // User menu dropdown
    this.profileLink = page.getByRole('link', { name: /profile/i });
    this.signOutBtn = page.getByRole('button', { name: /sign out/i });
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  // ─── Alpine.js helper ─────────────────────────────────────────────────────

  /**
   * Alpine.js x-show hides elements via display:none rather than removing them
   * from the DOM, so Playwright's toBeVisible() sees them as hidden even after
   * the trigger is clicked. This waits for the computed display to become visible.
   */
  private async waitForAlpineVisible(selector: string, timeout = 8000): Promise<void> {
    await this.page.waitForFunction(
      (sel: string) => {
        const el = document.querySelector(sel);
        return el && getComputedStyle(el).display !== 'none';
      },
      selector,
      { timeout },
    );
  }

  private async waitForAlpineHidden(selector: string, timeout = 8000): Promise<void> {
    await this.page.waitForFunction(
      (sel: string) => {
        const el = document.querySelector(sel);
        return !el || getComputedStyle(el).display === 'none';
      },
      selector,
      { timeout },
    );
  }

  // ─── Topbar actions ───────────────────────────────────────────────────────

  async fillSearch(text: string): Promise<void> {
    await this.searchInput.fill(text);
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }

  async openNotifications(): Promise<void> {
    await this.notificationBellBtn.click();
    await this.waitForAlpineVisible('[role="dialog"]#database-notifications');
  }

  async closeNotifications(): Promise<void> {
    await this.notificationModalCloseBtn.click();
    await this.waitForAlpineHidden('[role="dialog"]#database-notifications');
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.notificationMarkAllReadBtn.click();
  }

  async clearNotifications(): Promise<void> {
    await this.notificationClearBtn.click();
  }

  async goToNextNotificationPage(): Promise<void> {
    await this.notificationNextBtn.click();
    await expect(this.notificationItems.first()).toBeVisible({ timeout: 5000 });
  }

  async getNotificationBadgeCount(): Promise<number> {
    const text = await this.notificationBadge.textContent();
    return Number(text?.trim());
  }

  async getNotificationItemCount(): Promise<number> {
    return this.notificationItems.count();
  }

  // ─── Stat card helpers ────────────────────────────────────────────────────

  async getStatCardValue(card: Locator): Promise<number> {
    const valueEl = card.locator('.fi-wi-stats-overview-stat-value');
    const text = await valueEl.textContent();
    return Number(text?.trim());
  }

  async getStatCardHref(statText: string): Promise<string | null> {
    const link = this.page
      .locator('a.fi-wi-stats-overview-stat')
      .filter({ hasText: statText });
    return link.getAttribute('href');
  }

  // ─── User menu actions ────────────────────────────────────────────────────

  async openUserMenu(): Promise<void> {
    await this.userMenuTrigger.click();
    await expect(this.profileLink).toBeVisible({ timeout: 5000 });
  }

  async navigateToProfile(): Promise<void> {
    await this.openUserMenu();
    await this.profileLink.click();
  }

  async signOut(): Promise<void> {
    await this.openUserMenu();
    await this.signOutBtn.click();
  }

  // ─── Sidebar actions ──────────────────────────────────────────────────────

  async navigateToEmployees(): Promise<void> {
    await this.employeesLink.click();
    await this.page.waitForURL(/admin\/employees/, { timeout: 8000 });
  }

  async navigateToLeaveRequests(): Promise<void> {
    await this.leaveRequestsLink.click();
    await this.page.waitForURL(/admin\/leave-requests/, { timeout: 8000 });
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async assertOnDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(this.url);
    await expect(this.pageHeading).toBeVisible();
  }

  async assertStatCardVisible(card: Locator): Promise<void> {
    await expect(card).toBeVisible();
    await expect(card.locator('.fi-wi-stats-overview-stat-value')).toBeVisible();
  }

  async assertNotificationModalOpen(): Promise<void> {
    await this.waitForAlpineVisible('[role="dialog"]#database-notifications');
    await expect(this.notificationModalHeading).toBeVisible();
  }

  async assertNotificationModalClosed(): Promise<void> {
    await this.waitForAlpineHidden('[role="dialog"]#database-notifications');
  }
}