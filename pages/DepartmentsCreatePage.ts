import { Page, Locator } from '@playwright/test';

export class DepartmentsCreatePage {
  readonly page: Page;

  readonly enabledToggle: Locator;
  readonly departmentNameInput: Locator;
  readonly headOfDeptSelectBtn: Locator;
  readonly headOfDeptSearchInput: Locator;
  readonly headOfDeptDropdown: Locator;
  readonly submitBtn: Locator;
  readonly cancelBtn: Locator;
  readonly breadcrumbDepartments: Locator;
  readonly pageHeading: Locator;
  readonly validationModal: Locator;
  readonly validationModalOkBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.enabledToggle        = page.locator('button#form\\.is_enabled');
    this.departmentNameInput  = page.locator('input#form\\.name');
    this.headOfDeptSelectBtn  = page.locator('.fi-select-input-btn').first();
    this.headOfDeptDropdown   = page.locator('.fi-dropdown-panel[role="listbox"]');
    this.headOfDeptSearchInput = this.headOfDeptDropdown.locator('input[type="text"]');

    this.submitBtn = page.locator('button[type="submit"]', { hasText: /submit/i });
    this.cancelBtn = page.locator('.fi-sc-actions button', { hasText: /cancel/i });

    this.breadcrumbDepartments = page.locator('nav.fi-breadcrumbs a', { hasText: 'Departments' });
    this.pageHeading           = page.locator('h1');

    this.validationModal      = page.locator('#validation-error-modal');
    this.validationModalOkBtn = this.validationModal.locator('button', { hasText: /ok/i });
  }

  async goto() {
    await this.page.goto('https://hris.itmanage.com.au/admin/departments/create');
    await this.page.waitForLoadState('networkidle');
  }

  async fillDepartmentName(name: string) {
    await this.departmentNameInput.fill(name);
  }

  async clearDepartmentName() {
    await this.departmentNameInput.clear();
  }

  async toggleEnabled() {
    await this.enabledToggle.click();
  }

  async isEnabledOn(): Promise<boolean> {
    const checked = await this.enabledToggle.getAttribute('aria-checked');
    return checked === 'true';
  }

  async selectHeadOfDept(name: string) {
    await this.headOfDeptSelectBtn.click();
    await this.headOfDeptDropdown.waitFor({ state: 'visible', timeout: 10_000 });
    await this.headOfDeptSearchInput.fill(name);
    await this.page.waitForTimeout(1200); // respect 1000ms searchDebounce
    await this.page.waitForLoadState('networkidle');

    const option = this.page
      .locator('[role="option"], .fi-select-input-dropdown li')
      .filter({ hasText: name })
      .first();

    await option.waitFor({ state: 'visible', timeout: 10_000 });
    await option.click();
  }

  async submit() {
    await this.submitBtn.click();
  }

  async cancel() {
    await this.cancelBtn.click();
  }

  async dismissValidationModal() {
    await this.validationModalOkBtn.click();
    await this.validationModal.waitFor({ state: 'hidden', timeout: 5_000 });
  }
}