import { test as base } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { DepartmentsListPage } from '../pages/departments/DepartmentsListPage';
import { DepartmentFormPage } from '../pages/departments/DepartmentFormPage';
import { PushNotificationsListPage } from '../pages/push-notifications/PushNotificationsListPage';
import { PushNotificationFormPage } from '../pages/push-notifications/PushNotificationFormPage';
import { LoginPage } from '../pages/auth/LoginPage';

/**
 * Single test entry point for the whole UI suite. Replaces the per-folder
 * `_helpers.ts` files: page objects are lazily constructed per test, so specs
 * just declare what they need and stay focused on the scenario.
 *
 * Authentication comes from `storageState` (see playwright.config.ts +
 * global-setup); each page object's `goto()` fails fast if the session expired,
 * so no per-test login round-trip is needed.
 */
type UiFixtures = {
  loginPage: LoginPage;
  dashboard: DashboardPage;
  departments: DepartmentsListPage;
  departmentForm: DepartmentFormPage;
  pushNotifications: PushNotificationsListPage;
  pushNotificationForm: PushNotificationFormPage;
};

export const test = base.extend<UiFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  dashboard: async ({ page }, use) => use(new DashboardPage(page)),
  departments: async ({ page }, use) => use(new DepartmentsListPage(page)),
  departmentForm: async ({ page }, use) => use(new DepartmentFormPage(page)),
  pushNotifications: async ({ page }, use) => use(new PushNotificationsListPage(page)),
  pushNotificationForm: async ({ page }, use) => use(new PushNotificationFormPage(page)),
});

export { expect } from '@playwright/test';
