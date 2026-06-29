import { Page, Locator } from '@playwright/test';

/**
 * Filament admin sidebar. Uses role + href scoping rather than bare getByText,
 * which would match substrings anywhere on the page.
 */
export class Sidebar {
  readonly root: Locator;
  readonly activeItem: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('aside.fi-sidebar');
    this.activeItem = page.locator('li.fi-sidebar-item.fi-active');
  }

  /** A sidebar nav link scoped to the sidebar and matched by its href. */
  link(hrefFragment: string): Locator {
    return this.root.locator(`a[href*="${hrefFragment}"]`).first();
  }

  navItem(name: string | RegExp): Locator {
    return this.root.getByRole('link', { name });
  }

  goToEmployees() {
    return this.link('/admin/employees').click();
  }

  goToDepartments() {
    return this.link('/admin/departments').click();
  }

  goToLeaveRequests() {
    return this.link('/admin/leave-requests').click();
  }
}
