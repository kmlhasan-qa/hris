import { Page, Locator, expect } from '@playwright/test';

export class DepartmentsCreatePage {
  readonly page: Page;

  readonly enabledToggle: Locator;
 readonly departmentNameInput: Locator;
  readonly headOfDeptSelectBtn: Locator;
  readonly headOfDeptSearchInput: Locator;
  readonly headOfDeptDropdown: Locator;
  readonly submitBtn: Locator;
  readonly cancelBtn: Locator;
  readonly pageHeading: Locator;

  readonly deleteBtn: Locator;
  readonly deleteConfirmForm: Locator;
  readonly confirmDeleteBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.enabledToggle = page.locator('button#form\\.is_enabled');
    this.departmentNameInput = page.locator('input#form\\.name');

    this.headOfDeptSelectBtn = page.locator('.fi-select-input-btn').first();
    this.headOfDeptDropdown = page.locator('.fi-dropdown-panel[role="listbox"]');
    this.headOfDeptSearchInput =
      this.headOfDeptDropdown.locator('input[type="text"]');

    this.submitBtn = page.locator('button[type="submit"]', {
      hasText: /submit/i,
    });

    this.cancelBtn = page.locator('button', {
      hasText: /cancel/i,
    });

    this.pageHeading = page.locator('h1');

    // Delete locators
    this.deleteBtn = page.locator(
      `button[wire\\:click*="mountAction('delete'"]`
    );

    this.deleteConfirmForm = page.locator(
      `form[wire\\:submit\\.prevent="callMountedAction"]`
    );

    this.confirmDeleteBtn =
      this.deleteConfirmForm.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto(
      'https://hris.itmanage.com.au/admin/departments/create'
    );
  }

  async gotoEdit(id: string | number) {
    await this.page.goto(
      `https://hris.itmanage.com.au/admin/departments/${id}/edit`
    );
  }

  async fillDepartmentName(name: string) {
    await this.departmentNameInput.fill(name);
  }

  async selectHeadOfDept(name: string) {
    await this.headOfDeptSelectBtn.click();

    await this.headOfDeptDropdown.waitFor({
      state: 'visible',
      timeout: 10000,
    });

    await this.headOfDeptSearchInput.fill(name);

    await this.page.waitForTimeout(1200);

    const option = this.page
      .locator('[role="option"], .fi-select-input-dropdown li')
      .filter({ hasText: name })
      .first();

    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
  }

  async submit() {
    await this.submitBtn.click();
  }

  async cancel() {
    await this.cancelBtn.click();
  }

  async isEnabledOn(): Promise<boolean> {
    const checked = await this.enabledToggle.getAttribute('aria-checked');

    if (checked !== null) {
      return checked === 'true';
    }

    const className = (await this.enabledToggle.getAttribute('class')) || '';
    return className.includes('fi-color-success');
  }

  async deleteDepartment() {
    await this.deleteBtn.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    await this.deleteBtn.click();

    await this.deleteConfirmForm.waitFor({
      state: 'visible',
      timeout: 10000,
    });

    await expect(this.confirmDeleteBtn).toBeVisible();

    await this.confirmDeleteBtn.click();

    // Avoid waitForURL because delete redirect can be flaky
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
  }
}