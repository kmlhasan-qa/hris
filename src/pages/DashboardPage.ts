import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../core/BasePage';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { routes } from '../config/routes';

const NOTIFICATION_DIALOG = '[role="dialog"]#database-notifications';

/**
 * Admin dashboard. Locators + actions only (assertions in
 * `src/assertions/dashboard.assertions.ts`).
 *
 * Alpine.js toggles modals via `display:none` rather than detaching them, so
 * Playwright's visibility check is unreliable for them — `waitForComputedShown`
 * waits on the real computed style instead.
 */
export class DashboardPage extends BasePage {
  readonly sidebar = new Sidebar(this.page);
  readonly topbar = new Topbar(this.page);

  readonly heading: Locator;
  readonly searchInput: Locator;

  // Notifications
  readonly notificationBellBtn: Locator;
  readonly notificationBadge: Locator;
  readonly notificationModal: Locator;
  readonly notificationModalHeading: Locator;
  readonly notificationModalCloseBtn: Locator;
  readonly notificationMarkAllReadBtn: Locator;
  readonly notificationClearBtn: Locator;
  readonly notificationNextBtn: Locator;
  readonly notificationItems: Locator;

  // Widgets
  readonly totalEmployeesCard: Locator;
  readonly newHiresCard: Locator;
  readonly todayAttendanceCard: Locator;
  readonly latestNewsLink: Locator;

  // User menu
  readonly userMenuTrigger: Locator;
  readonly profileLink: Locator;
  readonly signOutBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.searchInput = page.getByPlaceholder('Search');

    this.notificationBellBtn = page.locator('[aria-label="Notifications"]').first();
    this.notificationBadge = page
      .locator('.fi-topbar-database-notifications-btn .fi-badge')
      .first();
    this.notificationModal = page.locator(NOTIFICATION_DIALOG);
    this.notificationModalHeading = this.notificationModal.getByRole('heading', {
      name: 'Notifications',
    });
    this.notificationModalCloseBtn = this.notificationModal.getByRole('button', { name: /close/i });
    this.notificationMarkAllReadBtn = this.notificationModal.getByRole('button', {
      name: /mark all as read/i,
    });
    this.notificationClearBtn = this.notificationModal.getByRole('button', { name: /clear/i });
    this.notificationNextBtn = this.notificationModal.getByRole('button', { name: /next/i });
    this.notificationItems = this.notificationModal.locator('.fi-no-notification');

    this.totalEmployeesCard = this.statCard('Total Employees');
    this.newHiresCard = this.statCard('New Hires (30 Days)');
    this.todayAttendanceCard = this.statCard("Today's Attendance");
    this.latestNewsLink = page.locator('[href*="newsletters"]').first();

    this.userMenuTrigger = page.locator('.fi-user-menu-trigger');
    this.profileLink = page.getByRole('link', { name: /profile/i });
    this.signOutBtn = page.getByRole('button', { name: /sign out/i });
  }

  goto(): Promise<void> {
    return this.open(routes.dashboard, this.heading);
  }

  statCard(label: string): Locator {
    return this.page.locator('.fi-wi-stats-overview-stat').filter({ hasText: label });
  }

  // ── Alpine display-state waits ──────────────────────────────────────────────
  private waitForComputedShown(visible: boolean, timeout = 8000): Promise<unknown> {
    return this.page.waitForFunction(
      ([sel, want]) => {
        const el = document.querySelector(sel as string);
        const shown = !!el && getComputedStyle(el).display !== 'none';
        return shown === want;
      },
      [NOTIFICATION_DIALOG, visible] as const,
      { timeout },
    );
  }

  // ── Topbar / search ─────────────────────────────────────────────────────────
  fillSearch(text: string): Promise<void> {
    return this.searchInput.fill(text);
  }

  clearSearch(): Promise<void> {
    return this.searchInput.clear();
  }

  // ── Notifications ─────────────────────────────────────────────────────────────
  async openNotifications(): Promise<void> {
    await this.notificationBellBtn.click();
    await this.waitForComputedShown(true);
  }

  async closeNotifications(): Promise<void> {
    await this.notificationModalCloseBtn.click();
    await this.waitForComputedShown(false);
  }

  waitForNotificationsOpen(): Promise<unknown> {
    return this.waitForComputedShown(true);
  }

  waitForNotificationsClosed(): Promise<unknown> {
    return this.waitForComputedShown(false);
  }

  async goToNextNotificationPage(): Promise<void> {
    await this.notificationNextBtn.click();
    await expect(this.notificationItems.first()).toBeVisible();
  }

  async notificationBadgeCount(): Promise<number> {
    const text = await this.notificationBadge.textContent();
    return Number(text?.trim());
  }

  notificationItemCount(): Promise<number> {
    return this.notificationItems.count();
  }

  // ── Stat cards ────────────────────────────────────────────────────────────────
  async statCardValue(card: Locator): Promise<number> {
    const text = await card.locator('.fi-wi-stats-overview-stat-value').textContent();
    return Number(text?.trim());
  }

  // ── User menu ─────────────────────────────────────────────────────────────────
  async openUserMenu(): Promise<void> {
    await this.userMenuTrigger.click();
    await expect(this.profileLink).toBeVisible();
  }

  async navigateToProfile(): Promise<void> {
    await this.openUserMenu();
    await this.profileLink.click();
  }

  async signOut(): Promise<void> {
    await this.openUserMenu();
    await this.signOutBtn.click();
  }
}
