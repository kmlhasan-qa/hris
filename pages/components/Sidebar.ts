import { Page, Locator, expect } from '@playwright/test';

export class Sidebar {
  readonly page: Page;

  readonly dashboard: Locator;
  readonly employees: Locator;
  readonly departments: Locator;
  readonly documents: Locator;
  readonly attendances: Locator;
  readonly leaveRequests: Locator;
  readonly roles: Locator;
  readonly admins: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dashboard = page.getByText('Dashboard');
    this.employees = page.getByText('Employees');
    this.departments = page.getByText('Departments');
    this.documents = page.getByText('Documents');
    this.attendances = page.getByText('Attendances');
    this.leaveRequests = page.getByText('Leave Requests');
    this.roles = page.getByText('Roles');
    this.admins = page.getByText('Admins');
  }

  async verifyVisible() {
    await expect(this.dashboard).toBeVisible();
    await expect(this.employees).toBeVisible();
    await expect(this.departments).toBeVisible();
  }

  async goToEmployees() {
    await this.employees.click();
  }

  async goToDepartments() {
    await this.departments.click();
  }

  async goToAttendances() {
    await this.attendances.click();
  }

  async goToLeaveRequests() {
    await this.leaveRequests.click();
  }
}